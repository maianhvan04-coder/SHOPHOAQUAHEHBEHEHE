const asyncHandler = require("../../../../core/asyncHandler");
const authService = require("./auth.service");

module.exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  const refreshToken = result.refreshToken

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ data: result });
});

module.exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body)
  res.json({ data: result })
})

module.exports.refreshToken = asyncHandler(async (req, res) => {
  const { accessToken, newRefreshToken } = await authService.refreshToken(req);

  res.cookie("refresh_token", newRefreshToken, {
    httpOnly: true,
    secure: false,      // production + https thì true
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({ accessToken });
});

module.exports.me = asyncHandler(async (req, res) => {
  const userId = req.user?.sub; // auth middleware đã set
  const data = await authService.getMe(userId, req.user);

  res.json({ data });
});
module.exports.logout = asyncHandler(async (req, res) => {
  await authService.logout(req);

  res.clearCookie("refresh_token", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: false
  })
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: false
  })

  return res.status(200).json({ message: "Logout thành công" });
});