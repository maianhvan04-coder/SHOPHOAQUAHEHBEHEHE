const { 
  createTaskService, 
  getAllTasksService, 
  deleteTaskService 
} = require("./task.service");

module.exports.handleCreateTask = async (req, res) => {
  const { keyword, productId, type, note } = req.body;

  if (!keyword || !productId) {
    return res.status(200).json({
      EC: 1,
      EM: "Vui lòng cung cấp đầy đủ keyword và sản phẩm liên quan",
      DT: null,
    });
  }

  const result = await createTaskService({ keyword, productId, type, note });
  return res.status(200).json(result);
};

module.exports.handleGetAllTasks = async (req, res) => {
  const result = await getAllTasksService();
  return res.status(200).json(result);
};

module.exports.handleDeleteTask = async (req, res) => {
  const { id } = req.params;
  const result = await deleteTaskService(id);
  return res.status(200).json(result);
};