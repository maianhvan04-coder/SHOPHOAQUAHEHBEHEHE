// src/utils/validators.js

// regex email đơn giản, đủ dùng
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MIN_PASSWORD = 5;
const MIN_NAME = 2;
const phoneRegex = {
  PHONE_VN: /^(0[3|5|7|8|9])([0-9]{8})$/,
  MONGO_OBJECT_ID: /^[0-9a-fA-F]{24}$/,
};
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
    if (form.fullName !== undefined)
      errors.fullName = `Họ tên tối thiểu ${MIN_NAME} ký tự`;
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
/* ================= PROFILE / USER FORM VALIDATORS ================= */

/**
 * Validate profile form (settings/profile)
 * @param {{fullName?:string, name?:string, email?:string, phone?:string, location?:string}} form
 * @returns {{isValid: boolean, errors: {fullName?:string, name?:string, email?:string, phone?:string, location?:string}}}
 */
export function validateProfile(form = {}) {
  const errors = {};

  const nameVal = normalize(form.fullName ?? form.name);

  if (isEmpty(nameVal)) {
    if (form.fullName !== undefined) errors.fullName = "Họ tên không được để trống";
    else errors.name = "Họ tên không được để trống";
  } else if (nameVal.length < MIN_NAME) {
    if (form.fullName !== undefined)
      errors.fullName = `Họ tên tối thiểu ${MIN_NAME} ký tự`;
    else errors.name = `Họ tên tối thiểu ${MIN_NAME} ký tự`;
  }

  // email: required + format
  const emailVal = validateEmail(form.email, errors);

  // phone: optional nhưng nếu có thì phải đúng format
  const phoneVal = normalize(form.phone);
  if (!isEmpty(phoneVal) && !phoneRegex.PHONE_VN.test(phoneVal)) {
    errors.phone = "Số điện thoại không đúng định dạng (VD: 0912345678)";
  }

  // location optional -> không validate

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values: {
      fullName: nameVal,
      email: emailVal,
      phone: phoneVal,
      location: normalize(form.location),
    },
  };
}

/**
 * Validate user create/update (admin UserForm)
 * - fullName required
 * - email required + format
 * - phone optional (VN)
 * - roleCode required
 * - password: create => required, update => optional; nếu có thì min length
 *
 * @param {{fullName?:string,email?:string,phone?:string,roleCode?:string,password?:string,isActive?:boolean}} form
 * @param {{isEdit?: boolean}} options
 * @returns {{isValid: boolean, errors: Record<string,string>, values: any}}
 */
export function validateUserForm(form = {}, options = {}) {
  const { isEdit = false } = options;
  const errors = {};

  const fullNameVal = normalize(form.fullName);

  if (isEmpty(fullNameVal)) {
    errors.fullName = "Họ tên không được để trống";
  } else if (fullNameVal.length < MIN_NAME) {
    errors.fullName = `Họ tên tối thiểu ${MIN_NAME} ký tự`;
  }

  const emailVal = validateEmail(form.email, errors);

  const phoneVal = normalize(form.phone);
  if (!isEmpty(phoneVal) && !phoneRegex.PHONE_VN.test(phoneVal)) {
    errors.phone = "Số điện thoại không đúng định dạng (VD: 0912345678)";
  }

  const roleCodeVal = normalize(form.roleCode);
  if (isEmpty(roleCodeVal)) {
    errors.roleCode = "Vui lòng chọn vai trò";
  }

  const passwordVal = normalize(form.password);

  if (!isEdit) {
    // create: bắt buộc
    if (isEmpty(passwordVal)) {
      errors.password = "Mật khẩu là bắt buộc khi tạo mới";
    } else if (passwordVal.length < MIN_PASSWORD) {
      errors.password = `Mật khẩu tối thiểu ${MIN_PASSWORD} ký tự`;
    }
  } else {
    // update: optional, nhưng nếu nhập thì check min
    if (!isEmpty(passwordVal) && passwordVal.length < MIN_PASSWORD) {
      errors.password = `Mật khẩu tối thiểu ${MIN_PASSWORD} ký tự`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values: {
      fullName: fullNameVal,
      email: emailVal?.toLowerCase?.() ?? emailVal,
      phone: phoneVal,
      roleCode: roleCodeVal,
      password: passwordVal,
      isActive: form.isActive !== false,
    },
  };
}

/**
 * Validate change password (settings)
 * @param {{currentPassword?:string,newPassword?:string,confirmPassword?:string}} form
 */
export function validateChangePassword(form = {}) {
  const errors = {};

  const currentPassword = normalize(form.currentPassword);
  const newPassword = normalize(form.newPassword);
  const confirmPassword = normalize(form.confirmPassword);

  if (isEmpty(currentPassword)) errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";

  if (isEmpty(newPassword)) errors.newPassword = "Vui lòng nhập mật khẩu mới";
  else if (newPassword.length < MIN_PASSWORD)
    errors.newPassword = `Mật khẩu tối thiểu ${MIN_PASSWORD} ký tự`;

  if (isEmpty(confirmPassword)) errors.confirmPassword = "Vui lòng nhập lại mật khẩu";
  else if (confirmPassword !== newPassword) errors.confirmPassword = "Mật khẩu nhập lại không khớp";

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values: { currentPassword, newPassword, confirmPassword },
  };
}

export { emailRegex, phoneRegex };
