import assert from 'assert';
import { authStorage } from '../src/lib/authStorage.js';

// Polyfill localStorage in Node test environment
global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
};

async function testAuthClient() {
  console.log('--- Testing Frontend Auth Storage ---');

  // 1. Initially null
  assert.strictEqual(authStorage.getToken(), null, 'Initial token should be null');

  // 2. Set token
  authStorage.setToken('sample_jwt_token_123');
  assert.strictEqual(
    authStorage.getToken(),
    'sample_jwt_token_123',
    'Saved token must match'
  );
  assert.strictEqual(
    global.localStorage.getItem('dsa_tracker_token'),
    'sample_jwt_token_123',
    'Storage key must be namespaced to dsa_tracker_token'
  );
  console.log('✓ Token saving and namespacing verified');

  // 3. Remove token
  authStorage.removeToken();
  assert.strictEqual(authStorage.getToken(), null, 'Token should be null after removal');
  console.log('✓ Token removal verified');

  // 4. authApi endpoint contracts
  const { authApi } = await import('../src/api/auth.api.js');
  assert.strictEqual(typeof authApi.googleLogin, 'function', 'authApi.googleLogin must be a function');
  assert.strictEqual(typeof authApi.forgotPassword, 'function', 'authApi.forgotPassword must be a function');
  assert.strictEqual(typeof authApi.resetPassword, 'function', 'authApi.resetPassword must be a function');
  console.log('✓ authApi Google and Password Recovery method contracts verified');

  console.log('--- Auth Storage Tests Passed Successfully ---');
}

testAuthClient().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
