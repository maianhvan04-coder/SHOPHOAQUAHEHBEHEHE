const path = require("path");
const express = require("express");

/**
 * Config view engine
 * @param {import("express").Express} app
 */
const configViewEngine = (app) => {
  // views folder
  app.set("views", path.join(__dirname, "../views"));
  app.set("view engine", "ejs");

  // static files (PHẢI dùng express.static)
  app.use(
    "/static",
    express.static(path.join(__dirname, "../public"))
  );
};

module.exports = configViewEngine;
