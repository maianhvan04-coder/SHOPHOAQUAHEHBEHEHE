const AuthProvider = require("../user/authProvider.model");
const User = require("../user/user.model");

// ===== LOCAL LOGIN =====
exports.findLocalAuthByEmail = (email) =>
  AuthProvider.findOne({
    provider: "local",
    email,
  });

// ===== GOOGLE LOGIN =====
exports.findGoogleAuthByProviderId = (googleId) =>
  AuthProvider.findOne({
    provider: "google",
    providerId: googleId,
  });

// ===== USER =====
exports.findUserByEmail = (email) =>
  User.findOne({ email });

exports.findUserById = (id) =>
  User.findOne({ _id: id, isDeleted: false });

// ===== CREATE =====
exports.createUser = (payload) =>
  User.create(payload);

exports.createAuthProvider = (payload) =>
  AuthProvider.create(payload);


// chỉ local mới reset password
exports.findLocalByResetTokenHash = (tokenHash) =>
  AuthProvider.findOne({
    provider: "local",
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  });