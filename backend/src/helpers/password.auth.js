const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

/**
 * Hash mật khẩu
 * @param {string} password plain password
 * @returns {Promise<string>} hashed password
 */
exports.hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * So sánh mật khẩu
 * @param {string} password plain password
 * @param {string} passwordHash hashed password
 * @returns {Promise<boolean>}
 */
exports.comparePassword = async (password, passwordHash) => {
  return bcrypt.compare(password, passwordHash);
};
