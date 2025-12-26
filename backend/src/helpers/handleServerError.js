module.exports = (res) => {
  return res.status(500).json({
    EC: -1,
    EM: "Lỗi server không mong muốn",
    DT: null,
  });
};
