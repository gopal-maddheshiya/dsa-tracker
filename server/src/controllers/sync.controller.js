const User = require('../models/User');
const Problem = require('../models/Problem');
const Attempt = require('../models/Attempt');
const leetcodeAdapter = require('../services/platformAdapters/leetcodeAdapter');
const codeforcesAdapter = require('../services/platformAdapters/codeforcesAdapter');
const gfgAdapter = require('../services/platformAdapters/gfgAdapter');
const codechefAdapter = require('../services/platformAdapters/codechefAdapter');

const SUPPORTED_PLATFORMS = ['leetcode', 'codeforces', 'gfg', 'codechef'];

const ADAPTERS = {
  leetcode: leetcodeAdapter,
  codeforces: codeforcesAdapter,
  gfg: gfgAdapter,
  codechef: codechefAdapter,
};

/**
 * Normalizes title for deduplication comparison (ignores punctuation, case, whitespace).
 */
function normalizeTitle(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/^\d+[\.\-\s]+/, '') // strip leading numbers like "42. "
    .replace(/[^a-z0-9]/g, '');
}

/**
 * @route   GET /api/sync/status
 * @desc    Get user's connected platforms, handles, and sync statuses
 */
const getSyncStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const defaultConnected = {
      leetcode: { handle: null, isConnected: false, lastSyncedAt: null, totalSynced: 0, stats: {} },
      codeforces: { handle: null, isConnected: false, lastSyncedAt: null, totalSynced: 0, stats: {} },
      gfg: { handle: null, isConnected: false, lastSyncedAt: null, totalSynced: 0, stats: {} },
      codechef: { handle: null, isConnected: false, lastSyncedAt: null, totalSynced: 0, stats: {} },
    };

    const connected = user.connectedPlatforms || defaultConnected;

    res.status(200).json({
      success: true,
      data: {
        leetcode: connected.leetcode || defaultConnected.leetcode,
        codeforces: connected.codeforces || defaultConnected.codeforces,
        gfg: connected.gfg || defaultConnected.gfg,
        codechef: connected.codechef || defaultConnected.codechef,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Extracts a clean handle from either a raw username, @handle, or full profile URL.
 */
function extractCleanHandle(platform, input) {
  if (!input) return '';
  let str = String(input).trim();
  str = str.replace(/^["']|["']$/g, '').trim();

  if (str.includes('http://') || str.includes('https://') || str.includes('/') || str.includes('.com') || str.includes('.org')) {
    try {
      const urlStr = str.startsWith('http') ? str : `https://${str}`;
      const url = new URL(urlStr);
      const segments = url.pathname.split('/').filter(Boolean);

      if (platform === 'leetcode') {
        if (segments[0] === 'u' && segments[1]) return segments[1].replace(/[^a-zA-Z0-9_-]/g, '');
        if (segments[0]) return segments[0].replace(/[^a-zA-Z0-9_-]/g, '');
      } else if (platform === 'codeforces') {
        if (segments[0] === 'profile' && segments[1]) return segments[1].replace(/[^a-zA-Z0-9_.-]/g, '');
        if (segments[0]) return segments[0].replace(/[^a-zA-Z0-9_.-]/g, '');
      } else if (platform === 'gfg') {
        if (segments[0] === 'user' && segments[1]) return segments[1].replace(/[^a-zA-Z0-9_.-]/g, '');
        if (segments[0]) return segments[0].replace(/[^a-zA-Z0-9_.-]/g, '');
      } else if (platform === 'codechef') {
        if (segments[0] === 'users' && segments[1]) return segments[1].replace(/[^a-zA-Z0-9_.-]/g, '');
        if (segments[0]) return segments[0].replace(/[^a-zA-Z0-9_.-]/g, '');
      }
    } catch {
      const parts = str.split('/').filter(Boolean);
      if (parts.length > 0) return parts[parts.length - 1].replace(/^@+/, '');
    }
  }

  return str.replace(/^@+/, '').replace(/\/+$/, '').trim();
}

/**
 * @route   POST /api/sync/connect
 * @desc    Verify and connect a platform handle
 */
const connectPlatform = async (req, res, next) => {
  try {
    const { platform, handle } = req.body;
    const cleanPlatform = String(platform || '').toLowerCase().trim();
    const cleanHandle = extractCleanHandle(cleanPlatform, handle);

    if (!SUPPORTED_PLATFORMS.includes(cleanPlatform)) {
      return res.status(400).json({
        success: false,
        message: `Platform '${cleanPlatform}' is not supported. Supported: ${SUPPORTED_PLATFORMS.join(', ')}`,
      });
    }

    if (!cleanHandle) {
      return res.status(400).json({
        success: false,
        message: 'Handle or valid profile URL is required',
      });
    }

    const adapter = ADAPTERS[cleanPlatform];
    const verification = await adapter.verifyUser(cleanHandle);

    if (!verification.isValid) {
      return res.status(400).json({
        success: false,
        message: verification.error || `Unable to verify ${cleanPlatform} account '${cleanHandle}'`,
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.connectedPlatforms) {
      user.connectedPlatforms = {};
    }

    user.connectedPlatforms[cleanPlatform] = {
      handle: verification.username || cleanHandle,
      isConnected: true,
      lastSyncedAt: user.connectedPlatforms[cleanPlatform]?.lastSyncedAt || null,
      totalSynced: user.connectedPlatforms[cleanPlatform]?.totalSynced || 0,
      stats: verification.stats || {},
    };

    user.markModified('connectedPlatforms');
    await user.save();

    res.status(200).json({
      success: true,
      message: `Successfully connected ${cleanPlatform.toUpperCase()} account '${verification.username || cleanHandle}'`,
      data: user.connectedPlatforms[cleanPlatform],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/sync/disconnect
 * @desc    Disconnect / unlink a platform handle
 */
const disconnectPlatform = async (req, res, next) => {
  try {
    const { platform } = req.body;
    const cleanPlatform = String(platform || '').toLowerCase().trim();

    if (!SUPPORTED_PLATFORMS.includes(cleanPlatform)) {
      return res.status(400).json({
        success: false,
        message: `Invalid platform '${cleanPlatform}'`,
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.connectedPlatforms && user.connectedPlatforms[cleanPlatform]) {
      user.connectedPlatforms[cleanPlatform].isConnected = false;
      user.markModified('connectedPlatforms');
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: `Disconnected ${cleanPlatform.toUpperCase()} account`,
      data: user.connectedPlatforms?.[cleanPlatform] || { isConnected: false },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Core internal helper to sync a single platform for a user.
 */
async function performPlatformSync(userId, platform) {
  const adapter = ADAPTERS[platform];
  if (!adapter) throw new Error(`Unsupported platform: ${platform}`);

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const connection = user.connectedPlatforms?.[platform];
  if (!connection || !connection.isConnected || !connection.handle) {
    throw new Error(`${platform.toUpperCase()} is not connected. Please connect your handle first.`);
  }

  // 1. Fetch solved problems from remote platform
  const fetchResult = await adapter.fetchSolvedProblems(connection.handle);
  if (!fetchResult.success) {
    throw new Error(fetchResult.error || `Failed to fetch problems from ${platform}`);
  }

  // 2. Fetch existing problems for user to deduplicate
  const existingProblems = await Problem.find({ userId }).select('title link platform').lean();

  const titleSet = new Set(existingProblems.map((p) => normalizeTitle(p.title)));
  const linkSet = new Set(existingProblems.map((p) => String(p.link || '').toLowerCase().trim()));

  let syncedCount = 0;
  let skippedDuplicates = 0;

  // 3. Process each fetched problem
  for (const item of fetchResult.problems) {
    const normTitle = normalizeTitle(item.title);
    const normLink = String(item.link || '').toLowerCase().trim();

    // Check if duplicate exists
    if (titleSet.has(normTitle) || (normLink && linkSet.has(normLink))) {
      skippedDuplicates++;
      continue;
    }

    // Insert new Problem with sync source semantics (historical sync excluded from active revision)
    const newProblem = await Problem.create({
      userId,
      title: item.title,
      platform: item.platform,
      link: item.link,
      difficulty: item.difficulty,
      topics: item.topics || [],
      source: 'sync',
      inRevisionQueue: false,
      createdAt: item.submittedAt || new Date(),
    });

    // Insert corresponding Attempt with historical timestamp
    await Attempt.create({
      problemId: newProblem._id,
      userId,
      status: 'solved',
      attemptedAt: item.submittedAt || new Date(),
      notes: `Synced from ${platform.toUpperCase()}`,
    });

    // Add to sets to avoid intra-batch duplicates
    titleSet.add(normTitle);
    if (normLink) linkSet.add(normLink);
    syncedCount++;
  }

  // 4. Update user connection metadata
  user.connectedPlatforms[platform].lastSyncedAt = new Date();
  user.connectedPlatforms[platform].totalSynced =
    (user.connectedPlatforms[platform].totalSynced || 0) + syncedCount;

  if (fetchResult.stats) {
    user.connectedPlatforms[platform].stats = {
      ...user.connectedPlatforms[platform].stats,
      ...fetchResult.stats,
    };
  }

  user.markModified('connectedPlatforms');
  await user.save();

  return {
    platform,
    syncedCount,
    skippedDuplicates,
    totalFetched: fetchResult.problems.length,
    stats: user.connectedPlatforms[platform].stats,
    lastSyncedAt: user.connectedPlatforms[platform].lastSyncedAt,
  };
}

/**
 * @route   POST /api/sync/:platform
 * @desc    Trigger a live sync for a specific platform
 */
const syncPlatform = async (req, res, next) => {
  try {
    const cleanPlatform = String(req.params.platform || '').toLowerCase().trim();

    if (!SUPPORTED_PLATFORMS.includes(cleanPlatform)) {
      return res.status(400).json({
        success: false,
        message: `Platform '${cleanPlatform}' is not supported. Supported: ${SUPPORTED_PLATFORMS.join(', ')}`,
      });
    }

    const result = await performPlatformSync(req.user._id, cleanPlatform);

    res.status(200).json({
      success: true,
      message: `Successfully synced ${result.syncedCount} new problem${result.syncedCount === 1 ? '' : 's'} from ${cleanPlatform.toUpperCase()} (${result.skippedDuplicates} duplicates skipped).`,
      data: result,
    });
  } catch (err) {
    res.status(err.message.includes('not connected') ? 400 : 502).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * @route   POST /api/sync/all
 * @desc    Sync all connected platforms for the user
 */
const syncAllPlatforms = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const connectedList = SUPPORTED_PLATFORMS.filter(
      (p) => user.connectedPlatforms?.[p]?.isConnected && user.connectedPlatforms?.[p]?.handle
    );

    if (connectedList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No platforms are currently connected. Please connect an account first.',
      });
    }

    const results = [];
    const errors = [];

    for (const platform of connectedList) {
      try {
        const r = await performPlatformSync(req.user._id, platform);
        results.push(r);
      } catch (err) {
        errors.push({ platform, error: err.message });
      }
    }

    const totalSynced = results.reduce((acc, curr) => acc + curr.syncedCount, 0);
    const totalSkipped = results.reduce((acc, curr) => acc + curr.skippedDuplicates, 0);

    res.status(200).json({
      success: true,
      message: `Sync completed: ${totalSynced} new problems added across ${results.length} platform(s) (${totalSkipped} duplicates skipped).`,
      data: {
        totalSynced,
        totalSkipped,
        results,
        errors,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/sync/batch-import
 * @desc    Batch import problems by list of URLs or slugs
 */
const batchImportProblems = async (req, res, next) => {
  try {
    const { platform = 'leetcode', items = [] } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of problem links or slugs',
      });
    }

    const adapter = ADAPTERS[platform];
    if (!adapter || !adapter.fetchProblemsBySlugs) {
      return res.status(400).json({
        success: false,
        message: `Batch import is currently supported for LeetCode`,
      });
    }

    const fetchedProblems = await adapter.fetchProblemsBySlugs(items);

    const existingProblems = await Problem.find({ userId }).select('title link platform').lean();
    const titleSet = new Set(existingProblems.map((p) => normalizeTitle(p.title)));
    const linkSet = new Set(existingProblems.map((p) => String(p.link || '').toLowerCase().trim()));

    let importedCount = 0;
    let skippedDuplicates = 0;

    for (const item of fetchedProblems) {
      const normTitle = normalizeTitle(item.title);
      const normLink = String(item.link || '').toLowerCase().trim();

      if (titleSet.has(normTitle) || (normLink && linkSet.has(normLink))) {
        skippedDuplicates++;
        continue;
      }

      const newProblem = await Problem.create({
        userId,
        title: item.title,
        platform: item.platform,
        link: item.link,
        difficulty: item.difficulty,
        topics: item.topics || [],
        source: 'sync',
        inRevisionQueue: false,
        createdAt: item.submittedAt || new Date(),
      });

      await Attempt.create({
        problemId: newProblem._id,
        userId,
        status: 'solved',
        attemptedAt: item.submittedAt || new Date(),
        notes: `Batch imported from ${platform.toUpperCase()}`,
      });

      titleSet.add(normTitle);
      if (normLink) linkSet.add(normLink);
      importedCount++;
    }

    // Update user's totalSynced count
    const user = await User.findById(userId);
    if (user && user.connectedPlatforms?.[platform]) {
      user.connectedPlatforms[platform].totalSynced =
        (user.connectedPlatforms[platform].totalSynced || 0) + importedCount;
      user.markModified('connectedPlatforms');
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: `Batch imported ${importedCount} problems (${skippedDuplicates} duplicates skipped).`,
      data: {
        importedCount,
        skippedDuplicates,
        totalCataloged: (user?.connectedPlatforms?.[platform]?.totalSynced || 0),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSyncStatus,
  connectPlatform,
  disconnectPlatform,
  syncPlatform,
  syncAllPlatforms,
  batchImportProblems,
};
