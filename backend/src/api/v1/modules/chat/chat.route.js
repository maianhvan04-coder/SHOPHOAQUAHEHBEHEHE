const router = require("express").Router();
const ctrl = require("./chat.controller");

router.post("/", ctrl.chat);

module.exports = router;
