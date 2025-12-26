// src/api/v1/modules/auth/auth.repo.js
const User = require("../user/user.model");

// login: chỉ user chưa xoá
exports.findByEmailForLogin = (email) => {
  return User.findOne({ email, isDeleted: false });
};

// register: tìm mọi user theo email (kể cả đã xoá)
exports.findAnyByEmail = (email) => {
  return User.findOne({ email }); // không filter isDeleted
};

// refresh: chỉ user chưa xoá
exports.findById = (id) => {
  return User.findOne({ _id: id, isDeleted: false });
};

// tạo user mới
exports.createUser = (payload) => {
  return User.create(payload);
};
