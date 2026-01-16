// security.rule.js
const auditRepo = require("../audit/audit.repo");

exports.detectLoginAnomaly = async ({
  user = null,
  email,
  ip,
  userAgent,
}) => {
  const alerts = [];

  // RULE 1: brute force
  const recentFails = await auditRepo.findRecentLoginFailures({
    email,
    minutes: 10,
  });

  if (recentFails.length >= 5) {
    alerts.push({
      level: "high",
      type: "BRUTE_FORCE",
      message: "Nhiều lần login thất bại trong thời gian ngắn",
      count: recentFails.length,
    });
  }

  // RULE 2 + 3: IP / device lạ
  if (user) {
    const lastSuccess = await auditRepo.findLastLoginSuccess(user._id);

    if (lastSuccess) {
      if (lastSuccess.ip !== ip) {
        alerts.push({
          level: "medium",
          type: "NEW_IP",
          message: "Login từ IP mới",
          oldIp: lastSuccess.ip,
          newIp: ip,
        });
      }

      if (
        JSON.stringify(lastSuccess.userAgent?.browser) !==
        JSON.stringify(userAgent?.browser)
      ) {
        alerts.push({
          level: "medium",
          type: "NEW_DEVICE",
          message: "Login từ thiết bị / trình duyệt mới",
        });
      }
    }
  }

  return alerts;
};
