module.exports = (schema) => {
    schema.index({ isDeleted: 1, isActive: 1 });
    schema.index({ category: 1 });
    schema.index({ isFeatured: 1, featuredRank: 1, createdAt: -1 });
};
