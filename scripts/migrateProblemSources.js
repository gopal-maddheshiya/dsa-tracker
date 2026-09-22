/**
 * Root execution wrapper for problem source migration script
 * Forwards execution to server/scripts/migrateProblemSources.js
 */
const { runMigration } = require('../server/scripts/migrateProblemSources');

runMigration()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
