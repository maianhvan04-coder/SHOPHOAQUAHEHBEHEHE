const router = require("express").Router();
const controller = require("./category.controller");

router.get("/me", controller.publicList);       // GET /me?search=&page=&limit=
router.get("/me/:id", controller.publicGetById);// GET /me/:id

module.exports = router;
