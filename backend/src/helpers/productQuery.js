const Tasks = require("../api/v1/modules/product/models/tasks.model");

const removeAccent = (str = "") =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

module.exports = async ({ search, category, isActive }) => {
  const query = { isDeleted: false };

  const rawKeyword =
    typeof search === "string" ? search.trim().toLowerCase() : "";

  if (rawKeyword) {
    const noAccentKeyword = removeAccent(rawKeyword);
    const tokens = noAccentKeyword.split(/\s+/).filter(Boolean);

    let productIdsFromTasks = [];
    let mainToken = null;

    /* 1️⃣ TASK – ƯU TIÊN CỤM ĐẦY ĐỦ */
    let taskMatches = await Tasks.find({
      $or: [
        { keyword: rawKeyword },
        { keywordNoAccent: noAccentKeyword },
      ],
    }).select("productId keyword keywordNoAccent");

    /* 2️⃣ TASK – TOKEN ĐƠN */
    if (!taskMatches.length && tokens.length) {
      taskMatches = await Tasks.find({
        $or: [
          { keyword: { $in: tokens } },
          { keywordNoAccent: { $in: tokens } },
        ],
      }).select("productId keyword keywordNoAccent");
    }

    if (taskMatches.length) {
      productIdsFromTasks = taskMatches.map((t) => t.productId);
      mainToken =
        taskMatches[0].keywordNoAccent || taskMatches[0].keyword;
    }

    /* 3️⃣ PRODUCT SEARCH – KẾT HỢP ĐÚNG */
    query.$or = [
      // ✅ TASK (alias / synonym)
      ...(productIdsFromTasks.length
        ? [{ _id: { $in: productIdsFromTasks } }]
        : []),

      // ✅ NAME – CÓ DẤU
      { name: { $regex: rawKeyword, $options: "i" } },

      // ✅ NAME – KHÔNG DẤU
      { nameNoAccent: { $regex: noAccentKeyword, $options: "i" } },

      // ✅ SLUG – KHÔNG DẤU
      { slug: { $regex: noAccentKeyword, $options: "i" } },
    ];
  }

  /* 4️⃣ FILTER KHÁC */
  if (category && category !== "all") {
    query.category = category;
  }

  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  return query;
};
