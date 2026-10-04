import assert from 'assert';
import { normalizeApiBaseUrl } from '../src/api/client.js';

async function testApiClient() {
  console.log('--- Starting API Client URL Normalization Tests ---');

  // 1. Default fallback when empty, null, or undefined
  assert.strictEqual(normalizeApiBaseUrl(null), '/api', 'null must default to /api');
  assert.strictEqual(normalizeApiBaseUrl(undefined), '/api', 'undefined must default to /api');
  assert.strictEqual(normalizeApiBaseUrl(''), '/api', 'empty string must default to /api');
  assert.strictEqual(normalizeApiBaseUrl('   '), '/api', 'whitespace must default to /api');
  console.log('✓ Default fallback for empty/null inputs verified');

  // 2. Local relative proxy paths
  assert.strictEqual(normalizeApiBaseUrl('/api'), '/api', '/api should be preserved');
  assert.strictEqual(normalizeApiBaseUrl('/api/'), '/api', 'trailing slash on /api/ should be stripped');
  console.log('✓ Relative proxy paths verified');

  // 3. Absolute URLs missing /api suffix (auto-appends /api)
  assert.strictEqual(
    normalizeApiBaseUrl('https://backend.onrender.com'),
    'https://backend.onrender.com/api',
    'Root origin must append /api'
  );
  assert.strictEqual(
    normalizeApiBaseUrl('https://backend.onrender.com/'),
    'https://backend.onrender.com/api',
    'Root origin with trailing slash must append /api'
  );
  assert.strictEqual(
    normalizeApiBaseUrl('http://localhost:5000'),
    'http://localhost:5000/api',
    'Localhost origin must append /api'
  );
  console.log('✓ Absolute URLs without /api suffix auto-appended correctly');

  // 4. Absolute URLs already containing /api suffix (no duplicate /api/api)
  assert.strictEqual(
    normalizeApiBaseUrl('https://backend.onrender.com/api'),
    'https://backend.onrender.com/api',
    'Origin already ending with /api must be preserved'
  );
  assert.strictEqual(
    normalizeApiBaseUrl('https://backend.onrender.com/api/'),
    'https://backend.onrender.com/api',
    'Trailing slash after /api must be stripped'
  );
  assert.strictEqual(
    normalizeApiBaseUrl('http://localhost:5000/api'),
    'http://localhost:5000/api',
    'Localhost with /api preserved'
  );
  console.log('✓ Absolute URLs with existing /api preserved without duplication');

  console.log('--- All API Client URL Normalization Tests Passed Successfully ---');
}

testApiClient().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
