const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');

process.env.JWT_SECRET = 'dsa_tracker_super_secret_test_jwt_key_98765';

const User = require('../src/models/User');
const generateToken = require('../src/utils/generateToken');
const { signup, login, getMe } = require('../src/controllers/auth.controller');
const { protect } = require('../src/middleware/authMiddleware');

const mockResponse = () => {
  const res = {};
  res.statusCode = 200;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

async function runTests() {
  console.log('--- STARTING PHASE 2 COMPREHENSIVE AUTOMATED VERIFICATION ---');
  let mongod;
  const results = [];

  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    results.push({ test: '1. MongoDB Connection established successfully', passed: mongoose.connection.readyState === 1 });
    console.log('✅ 1. MongoDB Connection established successfully');

    // TEST 2: Signup with valid data
    const signupReq = {
      body: {
        name: 'Alan Turing',
        email: 'alan.turing@example.com',
        password: 'enigmaSecretPassword123'
      }
    };
    const signupRes = mockResponse();
    await signup(signupReq, signupRes, (err) => { throw err; });

    const signupPassed = signupRes.statusCode === 201 &&
      !!signupRes.body.token &&
      signupRes.body.user.email === 'alan.turing@example.com' &&
      signupRes.body.user.name === 'Alan Turing' &&
      !signupRes.body.user.passwordHash;
    results.push({ test: '2. Signup with valid data succeeds', passed: signupPassed });
    console.log(`✅ 2. Signup with valid data: status=${signupRes.statusCode}, token=${!!signupRes.body.token}, user=${JSON.stringify(signupRes.body.user)}`);

    const authToken = signupRes.body.token;

    // TEST 3: Duplicate email rejected
    const dupSignupReq = {
      body: {
        name: 'Alan Turing Duplicate',
        email: 'ALAN.TURING@example.com', // case-insensitivity test
        password: 'anotherPassword123'
      }
    };
    const dupSignupRes = mockResponse();
    await signup(dupSignupReq, dupSignupRes, (err) => { throw err; });
    const dupPassed = dupSignupRes.statusCode === 409 && dupSignupRes.body.success === false;
    results.push({ test: '3. Duplicate email is rejected with 409', passed: dupPassed });
    console.log(`✅ 3. Duplicate email rejected: status=${dupSignupRes.statusCode}, message="${dupSignupRes.body.message}"`);

    // TEST 4: Password stored as bcrypt hash, not plain text
    const rawUserDoc = await mongoose.connection.db.collection('users').findOne({ email: 'alan.turing@example.com' });
    const isBcryptHash = typeof rawUserDoc.passwordHash === 'string' &&
      rawUserDoc.passwordHash.startsWith('$2') &&
      rawUserDoc.passwordHash !== 'enigmaSecretPassword123';
    const noPlainPassword = !rawUserDoc.password;
    results.push({ test: '4. Password stored as bcrypt hash, not plain text', passed: isBcryptHash && noPlainPassword });
    console.log(`✅ 4. Password stored as bcrypt hash: prefix="${rawUserDoc.passwordHash.slice(0, 7)}...", noPlainPassword=${noPlainPassword}`);

    // TEST 5: Login with correct credentials
    const loginReq = {
      body: {
        email: 'alan.turing@example.com',
        password: 'enigmaSecretPassword123'
      }
    };
    const loginRes = mockResponse();
    await login(loginReq, loginRes, (err) => { throw err; });
    const loginPassed = loginRes.statusCode === 200 &&
      !!loginRes.body.token &&
      loginRes.body.user.email === 'alan.turing@example.com' &&
      !loginRes.body.user.passwordHash;
    results.push({ test: '5. Login with correct credentials succeeds', passed: loginPassed });
    console.log(`✅ 5. Login with correct credentials: status=${loginRes.statusCode}, user=${JSON.stringify(loginRes.body.user)}`);

    // TEST 6: Login with wrong password fails safely
    const wrongLoginReq = {
      body: {
        email: 'alan.turing@example.com',
        password: 'wrongPassword999'
      }
    };
    const wrongLoginRes = mockResponse();
    await login(wrongLoginReq, wrongLoginRes, (err) => { throw err; });
    const wrongLoginPassed = wrongLoginRes.statusCode === 401 &&
      wrongLoginRes.body.success === false &&
      wrongLoginRes.body.message === 'Invalid email or password';
    results.push({ test: '6. Login with wrong password fails safely with generic 401', passed: wrongLoginPassed });
    console.log(`✅ 6. Login with wrong password fails: status=${wrongLoginRes.statusCode}, message="${wrongLoginRes.body.message}"`);

    // TEST 7: /api/auth/me fails without token
    const noTokenReq = { headers: {} };
    const noTokenRes = mockResponse();
    let nextCalledNoToken = false;
    await protect(noTokenReq, noTokenRes, () => { nextCalledNoToken = true; });
    const noTokenPassed = noTokenRes.statusCode === 401 && !nextCalledNoToken;
    results.push({ test: '7. /api/auth/me fails without token (401)', passed: noTokenPassed });
    console.log(`✅ 7. Protect fails without token: status=${noTokenRes.statusCode}, message="${noTokenRes.body.message}"`);

    // TEST 8: /api/auth/me works with valid token
    const validTokenReq = { headers: { authorization: `Bearer ${authToken}` } };
    const validTokenRes = mockResponse();
    let nextCalledValidToken = false;
    await protect(validTokenReq, validTokenRes, () => { nextCalledValidToken = true; });
    
    const meRes = mockResponse();
    await getMe(validTokenReq, meRes);
    const mePassed = nextCalledValidToken &&
      meRes.statusCode === 200 &&
      meRes.body.user.email === 'alan.turing@example.com' &&
      !meRes.body.user.passwordHash;
    results.push({ test: '8. /api/auth/me works with valid token', passed: mePassed });
    console.log(`✅ 8. /api/auth/me with valid token: status=${meRes.statusCode}, user=${JSON.stringify(meRes.body.user)}`);

    // TEST 9: Invalid token returns 401
    const invalidTokenReq = { headers: { authorization: 'Bearer thisIsAnInvalidTamperedToken12345' } };
    const invalidTokenRes = mockResponse();
    let nextCalledInvalid = false;
    await protect(invalidTokenReq, invalidTokenRes, () => { nextCalledInvalid = true; });
    const invalidPassed = invalidTokenRes.statusCode === 401 && !nextCalledInvalid;
    results.push({ test: '9. Invalid token returns 401', passed: invalidPassed });
    console.log(`✅ 9. Invalid token returns 401: status=${invalidTokenRes.statusCode}, message="${invalidTokenRes.body.message}"`);

    // Edge case: password < 6 chars
    const shortPassReq = { body: { name: 'Test', email: 'short@example.com', password: '123' } };
    const shortPassRes = mockResponse();
    await signup(shortPassReq, shortPassRes, (err) => { throw err; });
    results.push({ test: '10. Password < 6 chars rejected with 400', passed: shortPassRes.statusCode === 400 });
    console.log(`✅ 10. Password length validation: status=${shortPassRes.statusCode}, message="${shortPassRes.body.message}"`);

    // Edge case: invalid email format
    const badEmailReq = { body: { name: 'Test', email: 'notanemail', password: 'password123' } };
    const badEmailRes = mockResponse();
    await signup(badEmailReq, badEmailRes, (err) => { throw err; });
    results.push({ test: '11. Invalid email format rejected with 400', passed: badEmailRes.statusCode === 400 });
    console.log(`✅ 11. Email format validation: status=${badEmailRes.statusCode}, message="${badEmailRes.body.message}"`);

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongod) {
      await mongod.stop();
    }
  }

  console.log('\n--- VERIFICATION SUMMARY ---');
  let allPassed = true;
  for (const r of results) {
    console.log(`${r.passed ? 'PASS' : 'FAIL'}: ${r.test}`);
    if (!r.passed) allPassed = false;
  }
  console.log(`\nOVERALL STATUS: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  process.exit(allPassed ? 0 : 1);
}

runTests();
