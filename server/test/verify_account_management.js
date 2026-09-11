const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = 'dsa_tracker_super_secret_test_jwt_key_98765';

const User = require('../src/models/User');
const {
  signup,
  login,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} = require('../src/controllers/auth.controller');

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
  console.log('--- STARTING ACCOUNT MANAGEMENT & PASSWORD RESET TESTS ---');
  let mongod;
  try {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    console.log('✅ Connected to in-memory MongoDB');

    // 1. Signup a user
    const reqSignup = {
      body: { name: 'Initial User', email: 'account.test@example.com', password: 'oldpassword123' },
    };
    const resSignup = mockResponse();
    await signup(reqSignup, resSignup);
    if (resSignup.statusCode !== 201) throw new Error('Signup failed');
    const createdUser = await User.findOne({ email: 'account.test@example.com' });

    // 2. Update Profile Name
    const reqUpdate = {
      user: createdUser,
      body: { name: 'Updated Name User' },
    };
    const resUpdate = mockResponse();
    await updateProfile(reqUpdate, resUpdate);
    if (resUpdate.statusCode !== 200 || resUpdate.body.user.name !== 'Updated Name User') {
      throw new Error(`Profile update failed: ${JSON.stringify(resUpdate.body)}`);
    }
    console.log('✅ 1. Profile name updated successfully to "Updated Name User"');

    // 3. Change Password with wrong current password
    const reqBadPass = {
      user: createdUser,
      body: { currentPassword: 'wrongpassword', newPassword: 'brandnewpassword123' },
    };
    const resBadPass = mockResponse();
    await changePassword(reqBadPass, resBadPass);
    if (resBadPass.statusCode !== 400) {
      throw new Error(`Wrong password check failed: ${resBadPass.statusCode}`);
    }
    console.log('✅ 2. Wrong current password properly rejected (400)');

    // 4. Change Password with correct current password
    const reqGoodPass = {
      user: createdUser,
      body: { currentPassword: 'oldpassword123', newPassword: 'brandnewpassword123' },
    };
    const resGoodPass = mockResponse();
    await changePassword(reqGoodPass, resGoodPass);
    if (resGoodPass.statusCode !== 200) {
      throw new Error(`Change password failed: ${JSON.stringify(resGoodPass.body)}`);
    }
    console.log('✅ 3. Password changed successfully');

    // Verify login with new password
    const reqLoginNew = {
      body: { email: 'account.test@example.com', password: 'brandnewpassword123' },
    };
    const resLoginNew = mockResponse();
    await login(reqLoginNew, resLoginNew);
    if (resLoginNew.statusCode !== 200) {
      throw new Error('Login with new password failed');
    }
    console.log('✅ 4. Login with newly changed password verified');

    // 5. Forgot Password
    const reqForgot = {
      body: { email: 'account.test@example.com' },
    };
    const resForgot = mockResponse();
    await forgotPassword(reqForgot, resForgot);
    if (resForgot.statusCode !== 200 || !resForgot.body.resetCode) {
      throw new Error(`Forgot password failed: ${JSON.stringify(resForgot.body)}`);
    }
    const resetCode = resForgot.body.resetCode;
    console.log(`✅ 5. Forgot password generated resetCode: ${resetCode}`);

    // 6. Reset Password with resetCode
    const reqReset = {
      body: {
        email: 'account.test@example.com',
        resetCode,
        newPassword: 'resetpassword456',
      },
    };
    const resReset = mockResponse();
    await resetPassword(reqReset, resReset);
    if (resReset.statusCode !== 200) {
      throw new Error(`Reset password failed: ${JSON.stringify(resReset.body)}`);
    }
    console.log('✅ 6. Password reset completed successfully');

    // 7. Login with reset password
    const reqLoginReset = {
      body: { email: 'account.test@example.com', password: 'resetpassword456' },
    };
    const resLoginReset = mockResponse();
    await login(reqLoginReset, resLoginReset);
    if (resLoginReset.statusCode !== 200) {
      throw new Error('Login with reset password failed');
    }
    console.log('✅ 7. Login with reset password verified');

    console.log('\n🎉 ALL ACCOUNT MANAGEMENT & PASSWORD RESET TESTS PASSED!');
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongod) {
      await mongod.stop();
    }
  }
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
