module.exports = ({ search, category, isActive }) => {
  const query = { isDeleted: false };

  if (search) {
    const keyword = search.trim();

    const searchFriendly = keyword
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, ".*");

    query.$or = [
      { $text: { $search: keyword, $diacriticSensitive: false } },

      { slug: { $regex: searchFriendly, $options: "i" } },
    ];
  }

  if (category && category !== "all" && category !== "") {
    query.category = category;
  }

  if (isActive !== undefined) {
    query.isActive = isActive;
  }
  return query;
};
