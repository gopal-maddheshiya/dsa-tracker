const assert = require('assert');
const http = require('http');
const app = require('../src/app');

/**
 * Health & Core Middleware Smoke Test
 * Tests API health endpoint and 404 handler without requiring external dependencies.
 */
async function runHealthTest() {
  console.log('--- Starting API Health Test ---');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Test GET /api/health
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(healthRes.status, 200, 'Health endpoint should return status 200');
    const healthData = await healthRes.json();
    assert.strictEqual(healthData.success, true, 'Health response success should be true');
    assert.strictEqual(
      healthData.message,
      'DSA Tracker API is running',
      'Health response message must match specification'
    );
    console.log('✓ GET /api/health verified successfully');

    // 2. Test 404 handler
    const notFoundRes = await fetch(`${baseUrl}/api/nonexistent-route`);
    assert.strictEqual(notFoundRes.status, 404, 'Undefined route should return status 404');
    const notFoundData = await notFoundRes.json();
    assert.strictEqual(notFoundData.success, false, '404 response success should be false');
    console.log('✓ 404 Not Found JSON middleware verified successfully');

    console.log('--- All Phase 1 Server Tests Passed ---');
  } finally {
    server.close();
  }
}

runHealthTest().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
