module.exports = ({ search, category, isActive }) => {
  const query = { isDeleted: false };

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

 if (category && category !== "all" && category !== "") {
    query.category = category;
  }

  if (isActive !== undefined) {
    query.isActive = isActive;
  }
  return query;
};
