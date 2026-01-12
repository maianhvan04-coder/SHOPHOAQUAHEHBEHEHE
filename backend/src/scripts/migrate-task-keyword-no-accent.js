// scripts/migrate-task-keyword-no-accent.js
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

// 👉 DEBUG – PHẢI IN RA ĐƯỢC URI
console.log("ENV PATH =", path.resolve(__dirname, "../../.env"));
console.log("MONGO_URI =", process.env.MONGO_DB_URL);
const mongoose = require("mongoose");
const Tasks = require("../api/v1/modules/product/tasks.model");

const removeAccent = (str = "") =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL);

    const tasks = await Tasks.find({
      keywordNoAccent: { $exists: false },
    });

    for (const task of tasks) {
      task.keywordNoAccent = removeAccent(task.keyword);
      await task.save();
    }

    console.log(`✅ Migrated ${tasks.length} tasks`);
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
