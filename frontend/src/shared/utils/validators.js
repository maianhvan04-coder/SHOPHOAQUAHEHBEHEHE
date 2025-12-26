// src/utils/validators.js

// regex email đơn giản, đủ dùng
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MIN_PASSWORD = 5;
const MIN_NAME = 2;

function isEmpty(v) {
  return !v || !String(v).trim();
}

function normalize(v) {
  return String(v || "").trim();
}

function validateEmail(email, errors) {
  const e = normalize(email);

  if (isEmpty(e)) {
    errors.email = "Vui lòng nhập email";
  } else if (!emailRegex.test(e)) {
    errors.email = "Email không đúng định dạng";
  }

  return e;
}

function validatePassword(password, errors) {
  const p = normalize(password);

  if (isEmpty(p)) {
    errors.password = "Vui lòng nhập mật khẩu";
  } else if (p.length < MIN_PASSWORD) {
    errors.password = `Mật khẩu tối thiểu ${MIN_PASSWORD} ký tự`;
  }

  return p;
}

/**
 * Validate login form
 * @param {{email: string, password: string}} form
 * @returns {{isValid: boolean, errors: {email?: string, password?: string}}}
 */
export function validateLogin(form = {}) {
  const errors = {};

  validateEmail(form.email, errors);
  validatePassword(form.password, errors);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate register form
 * Hỗ trợ cả name hoặc fullName
 * @param {{name?:string, fullName?:string, email:string, password:string, confirmPassword:string}} form
 * @returns {{isValid: boolean, errors: {name?:string, fullName?:string, email?: string, password?: string, confirmPassword?: string}}}
 */
export function validateRegister(form = {}) {
  const errors = {};

  const nameVal = normalize(form.fullName ?? form.name);

  if (isEmpty(nameVal)) {
    // ưu tiên fullName nếu bạn dùng field đó
    if (form.fullName !== undefined) errors.fullName = "Vui lòng nhập họ tên";
    else errors.name = "Vui lòng nhập tên";
  } else if (nameVal.length < MIN_NAME) {
    if (form.fullName !== undefined) errors.fullName = `Họ tên tối thiểu ${MIN_NAME} ký tự`;
    else errors.name = `Tên tối thiểu ${MIN_NAME} ký tự`;
  }

  const password = validatePassword(form.password, errors);
  validateEmail(form.email, errors);

  const confirmPassword = normalize(form.confirmPassword);

  if (isEmpty(confirmPassword)) {
    errors.confirmPassword = "Vui lòng nhập lại mật khẩu";
  } else if (confirmPassword !== password) {
    errors.confirmPassword = "Mật khẩu nhập lại không khớp";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export { emailRegex };
