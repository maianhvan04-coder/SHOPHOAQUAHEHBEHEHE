// src/features/audit/security/securityAction.config.js
import {
  ArrowRightOnRectangleIcon,
  XCircleIcon,
  ShieldExclamationIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

export const SECURITY_ACTION_CONFIG = {
  login: {
    label: "Đăng nhập thành công",
    color: "green",
    icon: ArrowRightOnRectangleIcon,
    severity: "info",
  },

  login_failed: {
    label: "Đăng nhập thất bại",
    color: "red",
    icon: XCircleIcon,
    severity: "warning",
  },

  brute_force: {
    label: "Tấn công brute-force",
    color: "red",
    icon: ShieldExclamationIcon,
    severity: "critical",
  },

  account_locked: {
    label: "Tài khoản bị khóa",
    color: "orange",
    icon: LockClosedIcon,
    severity: "critical",
  },
};
