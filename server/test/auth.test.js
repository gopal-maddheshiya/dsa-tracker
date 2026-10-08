const assert = require('assert');
const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

// Set test environment variables before importing app
process.env.JWT_SECRET = 'test_secret_key_for_unit_tests_123456';
process.env.NODE_ENV = 'test';

const app = require('../src/app');
const User = require('../src/models/User');

/**
 * Phase 3 Authentication Test Suite
 * Covers 17 security scenarios across Signup, Login, Auth Middleware, and /api/auth/me
 */
async function runAuthTests() {
  console.log('--- Starting Phase 3 Backend Authentication Test Suite ---');

  // Start in-memory MongoDB
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Start test HTTP server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // -------------------------------------------------------------------------
    // SIGNUP TESTS
    // -------------------------------------------------------------------------

    // 1. Valid signup succeeds
    const signupRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'superSecretPassword123',
      }),
    });
    assert.strictEqual(signupRes.status, 201, 'Valid signup should return 201 Created');
    const signupData = await signupRes.json();
    assert.strictEqual(signupData.success, true);
    assert.ok(signupData.data.token, 'Signup must return an authentication token');
    assert.strictEqual(signupData.data.user.name, 'Ada Lovelace');
    assert.strictEqual(signupData.data.user.email, 'ada@example.com');
    console.log('✓ 1. Valid signup succeeds with 201 and token');

    // 2. Password is stored hashed, NOT plaintext
    const dbUser = await User.findOne({ email: 'ada@example.com' }).select('+passwordHash');
    assert.ok(dbUser.passwordHash, 'passwordHash must exist in DB');
    assert.notStrictEqual(
      dbUser.passwordHash,
      'superSecretPassword123',
      'Password must not be stored in plaintext'
    );
    assert.ok(
      dbUser.passwordHash.startsWith('$2'),
      'Password hash must follow standard bcrypt format ($2a$ or $2b$)'
    );
    console.log('✓ 2. Password is encrypted with bcrypt, not stored plaintext');

    // 3. Response does not expose passwordHash
    assert.strictEqual(signupData.data.user.passwordHash, undefined);
    assert.strictEqual(signupData.data.user.password, undefined);
    console.log('✓ 3. Signup response never exposes password or passwordHash');

    // 4. Duplicate email is rejected with 409
    const duplicateRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Another Ada',
        email: 'ADA@example.com', // test case-insensitivity
        password: 'anotherPassword123',
      }),
    });
    assert.strictEqual(duplicateRes.status, 409, 'Duplicate email must return 409 Conflict');
    const duplicateData = await duplicateRes.json();
    assert.strictEqual(duplicateData.success, false);
    assert.strictEqual(duplicateData.message, 'An account with this email already exists');
    console.log('✓ 4. Duplicate email is rejected with HTTP 409');

    // 5. Invalid signup inputs are rejected with 400
    // 5a. Missing name
    const badNameRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '   ', email: 'valid@example.com', password: 'password123' }),
    });
    assert.strictEqual(badNameRes.status, 400);

    // 5b. Invalid email format
    const badEmailRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Valid Name', email: 'not-an-email', password: 'password123' }),
    });
    assert.strictEqual(badEmailRes.status, 400);

    // 5c. Password too short (< 6 chars)
    const shortPassRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Valid Name', email: 'short@example.com', password: '123' }),
    });
    assert.strictEqual(shortPassRes.status, 400);
    console.log('✓ 5. Invalid signup inputs (empty name, bad email, short password) rejected with 400');

    // -------------------------------------------------------------------------
    // LOGIN TESTS
    // -------------------------------------------------------------------------

    // 6. Valid credentials return token and safe user (200)
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ada@example.com',
        password: 'superSecretPassword123',
      }),
    });
    assert.strictEqual(loginRes.status, 200, 'Valid login should return 200 OK');
    const loginData = await loginRes.json();
    assert.strictEqual(loginData.success, true);
    assert.ok(loginData.data.token, 'Login must return an authentication token');
    assert.strictEqual(loginData.data.user.name, 'Ada Lovelace');
    const validToken = loginData.data.token;
    console.log('✓ 6. Valid login returns 200 and token');

    // 7. Wrong password returns 401 with generic message
    const wrongPassRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ada@example.com',
        password: 'wrongPassword123',
      }),
    });
    assert.strictEqual(wrongPassRes.status, 401, 'Wrong password should return 401');
    const wrongPassData = await wrongPassRes.json();
    assert.strictEqual(wrongPassData.success, false);
    assert.strictEqual(wrongPassData.message, 'Invalid email or password');
    console.log('✓ 7. Wrong password returns 401 with generic message');

    // 8. Nonexistent email returns 401 with generic message (no enumeration)
    const nonExistentRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'somePassword123',
      }),
    });
    assert.strictEqual(nonExistentRes.status, 401, 'Nonexistent user should return 401');
    const nonExistentData = await nonExistentRes.json();
    assert.strictEqual(nonExistentData.success, false);
    assert.strictEqual(nonExistentData.message, 'Invalid email or password');
    console.log('✓ 8. Nonexistent email returns 401 with generic message');

    // 9. Response does not expose passwordHash
    assert.strictEqual(loginData.data.user.passwordHash, undefined);
    assert.strictEqual(loginData.data.user.password, undefined);
    console.log('✓ 9. Login response never exposes password or passwordHash');

    // -------------------------------------------------------------------------
    // AUTH MIDDLEWARE TESTS
    // -------------------------------------------------------------------------

    // 10. Missing Authorization header returns 401
    const noAuthRes = await fetch(`${baseUrl}/api/auth/me`);
    assert.strictEqual(noAuthRes.status, 401, 'Missing auth header should return 401');
    console.log('✓ 10. Missing Authorization header returns 401');

    // 11. Malformed Bearer header returns 401
    const malformedAuthRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: 'Basic dXNlcjpwYXNz' },
    });
    assert.strictEqual(malformedAuthRes.status, 401, 'Non-Bearer header should return 401');
    console.log('✓ 11. Malformed Bearer header returns 401');

    // 12. Invalid JWT returns 401
    const invalidTokenRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: 'Bearer this.is.an.invalid.token' },
    });
    assert.strictEqual(invalidTokenRes.status, 401, 'Invalid token should return 401');
    console.log('✓ 12. Invalid JWT returns 401');

    // 13. Expired JWT returns 401
    const expiredToken = jwt.sign(
      { userId: dbUser._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' }
    );
    const expiredTokenRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert.strictEqual(expiredTokenRes.status, 401, 'Expired token should return 401');
    console.log('✓ 13. Expired JWT returns 401');

    // 14. Valid JWT reaches protected route
    const validAuthRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    assert.strictEqual(validAuthRes.status, 200, 'Valid token should access protected route');
    console.log('✓ 14. Valid JWT successfully accesses protected route');

    // -------------------------------------------------------------------------
    // CURRENT USER (GET /api/auth/me) TESTS
    // -------------------------------------------------------------------------

    // 15. Valid token returns current user
    const meData = await validAuthRes.json();
    assert.strictEqual(meData.success, true);
    assert.strictEqual(meData.data.user.name, 'Ada Lovelace');
    assert.strictEqual(meData.data.user.email, 'ada@example.com');
    assert.strictEqual(meData.data.user.id, dbUser._id.toString());
    console.log('✓ 15. GET /api/auth/me returns accurate user identity');

    // 16. Invalid/deleted user identity is rejected with 401
    const deletedUserToken = jwt.sign(
      { userId: new mongoose.Types.ObjectId().toString() },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const deletedUserRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${deletedUserToken}` },
    });
    assert.strictEqual(deletedUserRes.status, 401, 'Deleted/nonexistent user token should return 401');
    const deletedUserData = await deletedUserRes.json();
    assert.strictEqual(deletedUserData.message, 'User account no longer exists');
    console.log('✓ 16. Deleted user identity returns 401 on /api/auth/me');

    // 17. passwordHash is never returned on /api/auth/me
    assert.strictEqual(meData.data.user.passwordHash, undefined);
    assert.strictEqual(meData.data.user.password, undefined);
    console.log('✓ 17. GET /api/auth/me never exposes password or passwordHash');

    // -------------------------------------------------------------------------
    // PASSWORD RECOVERY & RESET TESTS
    // -------------------------------------------------------------------------

    // 18. Forgot password with valid email generates token
    const forgotRes = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ada@example.com' }),
    });
    assert.strictEqual(forgotRes.status, 200, 'Forgot password should return 200');
    const forgotData = await forgotRes.json();
    assert.strictEqual(forgotData.success, true);
    assert.ok(forgotData.data.resetToken, 'Forgot password returns resetToken');
    assert.ok(forgotData.data.resetUrl, 'Forgot password returns resetUrl');
    const resetToken = forgotData.data.resetToken;
    console.log('✓ 18. POST /api/auth/forgot-password returns reset token and URL');

    // 19. Forgot password with nonexistent email returns 200 without exposing token
    const fakeForgotRes = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@example.com' }),
    });
    assert.strictEqual(fakeForgotRes.status, 200);
    const fakeForgotData = await fakeForgotRes.json();
    assert.strictEqual(fakeForgotData.success, true);
    assert.strictEqual(fakeForgotData.data, undefined);
    console.log('✓ 19. POST /api/auth/forgot-password handles nonexistent email securely');

    // 20. Reset password with valid token updates password and returns user + auth token
    const resetRes = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: resetToken,
        password: 'brandNewPassword456',
      }),
    });
    assert.strictEqual(resetRes.status, 200, 'Reset password should return 200');
    const resetData = await resetRes.json();
    assert.strictEqual(resetData.success, true);
    assert.ok(resetData.data.token, 'Reset password returns auth token');
    assert.strictEqual(resetData.data.user.email, 'ada@example.com');
    console.log('✓ 20. POST /api/auth/reset-password successfully resets password & logs in');

    // 21. Login with old password fails, login with new password succeeds
    const oldLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ada@example.com',
        password: 'superSecretPassword123',
      }),
    });
    assert.strictEqual(oldLoginRes.status, 401, 'Old password must be rejected');

    const newLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ada@example.com',
        password: 'brandNewPassword456',
      }),
    });
    assert.strictEqual(newLoginRes.status, 200, 'New password must succeed');
    console.log('✓ 21. New password functions properly and old password is invalidated');

    // 22. Reusing an already-consumed reset token is rejected
    const reuseResetRes = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: resetToken,
        password: 'anotherNewPassword789',
      }),
    });
    assert.strictEqual(reuseResetRes.status, 400, 'Reused reset token must be rejected');
    console.log('✓ 22. Consumed or invalid reset token is rejected with 400');

    console.log('--- All Phase 3 Authentication & Password Recovery Tests Passed Successfully ---');
  } finally {
    server.close();
    await mongoose.disconnect();
    await mongoServer.stop();
  }
}

runAuthTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
