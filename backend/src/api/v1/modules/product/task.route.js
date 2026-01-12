const router = require("express").Router();
const controller = require("./task.controller");
// TODO: Lắp middleware auth sau khi test xong logic tìm kiếm

router.get("/", controller.handleGetAllTasks);

router.post("/create", controller.handleCreateTask);

router.delete("/:id", controller.handleDeleteTask);

module.exports = router;
