const Tasks = require("../model/tasks.model");

module.exports.createTaskService = async (data) => {
  try {
    const { keyword, productId, type, note } = data;

    const cleanKeyword = keyword ? keyword.trim().toLowerCase() : "";

    if (!cleanKeyword) {
      return { EC: 1, EM: "Từ khóa không được để trống", DT: null };
    }

    const isExist = await Tasks.findOne({
      keyword: cleanKeyword,
      productId: productId,
    });

    if (isExist) {
      return { EC: 1, EM: "Từ khóa này đã tồn tại cho sản phẩm này", DT: null };
    }

    const newTask = await Tasks.create({
      keyword: cleanKeyword,
      productId,
      type: type || "alias",
      note: note || "",
    });

    return { EC: 0, EM: "Thêm từ khóa thành công", DT: newTask };
  } catch (error) {
    return { EC: -1, EM: "Lỗi Service: " + error.message, DT: null };
  }
};


module.exports.getAllTasksService = async () => {
  try {
    const data = await Tasks.find()
      .populate("productId", "name slug price")
      .sort({ createdAt: -1 });

    return { EC: 0, EM: "Lấy danh sách thành công", DT: data };
  } catch (error) {
    return { EC: -1, EM: "Lỗi Service: " + error.message, DT: null };
  }
};


module.exports.deleteTaskService = async (id) => {
  try {
    await Tasks.findByIdAndDelete(id);
    return { EC: 0, EM: "Xóa từ khóa thành công", DT: null };
  } catch (error) {
    return { EC: -1, EM: "Lỗi Service: " + error.message, DT: null };
  }
};