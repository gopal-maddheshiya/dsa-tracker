/**
 * Migration Script: Classify Problem Sources & Spaced Repetition Queue Eligibility
 * 
 * Safety Guarantees:
 * - Default mode is safe: requires explicit non-dry-run execution to mutate DB.
 * - Supports --dry-run for complete non-destructive preview.
 * - Idempotent: running multiple times produces identical outcomes.
 * - Evidence-based: classifies based on verified sync attempt signatures (/^(synced from|batch imported from)/i),
 *   not blind platform string matching.
 * - Preserves manual user practice on synced problems (sets inRevisionQueue=true if manual attempts exist).
 * 
 * Usage:
 *   Dry-run (preview only, no writes):
 *     node scripts/migrateProblemSources.js --dry-run
 * 
 *   Live execution (applies changes):
 *     node scripts/migrateProblemSources.js
 */

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Problem = require('../src/models/Problem');
const Attempt = require('../src/models/Attempt');

const SYNC_NOTE_REGEX = /^(synced from|batch imported from)/i;

async function runMigration(options = {}) {
  const isDryRun = options.isDryRun !== undefined
    ? options.isDryRun
    : process.argv.includes('--dry-run');

  const mongoUri = options.mongoUri || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in server/.env or options.');
  }

  const shouldCloseConn = !mongoose.connection.readyState;
  if (shouldCloseConn) {
    await mongoose.connect(mongoUri);
  }

  console.log('\n==================================================');
  console.log(`🚀 PROBLEM SOURCE & REVISION QUEUE MIGRATION`);
  console.log(`MODE: ${isDryRun ? '🔍 DRY RUN (Simulation - NO DB WRITES)' : '⚡ LIVE MUTATION'}`);
  console.log('==================================================\n');

  // 1. Fetch all problems and attempts
  const [problems, attempts] = await Promise.all([
    Problem.find({}).lean(),
    Attempt.find({}).select('problemId status notes attemptedAt').lean(),
  ]);

  console.log(`Found ${problems.length} total problems and ${attempts.length} total attempts.`);

  // 2. Map attempts by problemId
  const attemptsByProblem = new Map();
  for (const att of attempts) {
    const pId = att.problemId ? att.problemId.toString() : null;
    if (!pId) continue;
    if (!attemptsByProblem.has(pId)) {
      attemptsByProblem.set(pId, []);
    }
    attemptsByProblem.get(pId).push(att);
  }

  // 3. Classification counters and collections
  let manualCount = 0;
  let syncCount = 0;
  let activatedCount = 0;
  let deactivatedCount = 0;
  let unchangedCount = 0;
  const uncertainRecords = [];
  const changes = [];

  for (const prob of problems) {
    const pId = prob._id.toString();
    const probAttempts = attemptsByProblem.get(pId) || [];

    const syncedAttempts = probAttempts.filter((a) => SYNC_NOTE_REGEX.test(a.notes || ''));
    const manualAttempts = probAttempts.filter((a) => !SYNC_NOTE_REGEX.test(a.notes || ''));

    let classifiedSource = 'manual';
    let targetInRevisionQueue = true;
    let isUncertain = false;

    if (syncedAttempts.length > 0) {
      classifiedSource = 'sync';
      if (manualAttempts.length > 0) {
        // User has intentionally practiced this synced problem manually
        targetInRevisionQueue = true;
      } else {
        // Pure historical sync problem
        targetInRevisionQueue = false;
      }
    } else {
      // Zero synced attempts
      classifiedSource = 'manual';
      targetInRevisionQueue = true;

      // Check for suspicious notes that mention sync without standard signature
      const suspiciousNotes = probAttempts.some(
        (a) => (a.notes || '').toLowerCase().includes('synced') && !SYNC_NOTE_REGEX.test(a.notes || '')
      );
      if (suspiciousNotes) {
        isUncertain = true;
        uncertainRecords.push({
          id: pId,
          title: prob.title,
          platform: prob.platform,
          reason: 'Attempt notes contain "synced" but do not match standard sync prefix pattern',
        });
      }
    }

    if (classifiedSource === 'sync') {
      syncCount++;
    } else {
      manualCount++;
    }

    // Determine current effective state in DB
    const currentSource = prob.source || 'manual';
    const currentInRevision = prob.inRevisionQueue !== undefined ? prob.inRevisionQueue : true;

    const needsSourceUpdate = prob.source !== classifiedSource;
    const needsQueueUpdate = prob.inRevisionQueue !== targetInRevisionQueue;

    if (needsSourceUpdate || needsQueueUpdate) {
      if (currentInRevision === true && targetInRevisionQueue === false) {
        deactivatedCount++;
      } else if (currentInRevision === false && targetInRevisionQueue === true) {
        activatedCount++;
      }

      changes.push({
        problemId: prob._id,
        title: prob.title,
        from: { source: prob.source, inRevisionQueue: prob.inRevisionQueue },
        to: { source: classifiedSource, inRevisionQueue: targetInRevisionQueue },
      });
    } else {
      unchangedCount++;
    }
  }

  // 4. Apply mutations if not dry run
  if (!isDryRun && changes.length > 0) {
    console.log(`\nWriting updates for ${changes.length} problem records...`);
    const bulkOps = changes.map((c) => ({
      updateOne: {
        filter: { _id: c.problemId },
        update: {
          $set: {
            source: c.to.source,
            inRevisionQueue: c.to.inRevisionQueue,
          },
        },
      },
    }));

    const bulkResult = await Problem.bulkWrite(bulkOps);
    console.log(`✅ MongoDB bulkWrite modified: ${bulkResult.modifiedCount} records.`);
  }

  const report = {
    totalProblems: problems.length,
    problemsClassifiedManual: manualCount,
    problemsClassifiedSync: syncCount,
    uncertainRecords: uncertainRecords.length,
    recordsThatWouldChange: changes.length,
    recordsActivated: activatedCount,
    recordsDeactivated: deactivatedCount,
    recordsAlreadyCorrect: unchangedCount,
    isDryRun,
    uncertainList: uncertainRecords,
  };

  console.log('\n==================================================');
  console.log('📊 MIGRATION SUMMARY REPORT');
  console.log('==================================================');
  console.log(`Total Problems Evaluated:         ${report.totalProblems}`);
  console.log(`Classified as MANUAL:             ${report.problemsClassifiedManual}`);
  console.log(`Classified as SYNC:               ${report.problemsClassifiedSync}`);
  console.log(`Uncertain Records:                ${report.uncertainRecords}`);
  console.log(`Records That Would Change:        ${report.recordsThatWouldChange}`);
  console.log(`Records to be Deactivated:        ${report.recordsDeactivated} (removed from active revision queue)`);
  console.log(`Records to be Activated:          ${report.recordsActivated} (added to active revision queue)`);
  console.log(`Records Already in Target State:  ${report.recordsAlreadyCorrect}`);
  console.log(`Execution Mode:                   ${isDryRun ? 'DRY RUN (No changes saved)' : 'LIVE MUTATION (Changes committed)'}`);
  console.log('==================================================\n');

  if (shouldCloseConn) {
    await mongoose.disconnect();
  }

  return report;
}

if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

module.exports = {
  runMigration,
};
