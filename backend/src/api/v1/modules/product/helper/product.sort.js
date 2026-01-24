const SORT_MAP = {
    oldest: { createdAt: 1 },
    newest: { createdAt: -1 },
    price_asc: { price: 1, createdAt: -1 },
    price_desc: { price: -1, createdAt: -1 },
    name_asc: { name: 1 },
    name_desc: { name: -1 },
    featured: { isFeatured: -1, featuredRank: 1, createdAt: -1 },
};

exports.buildProductSort = (sortKey) => SORT_MAP[sortKey] || SORT_MAP.newest;
exports.PRODUCT_SORT_KEYS = Object.keys(SORT_MAP); // nếu sau này muốn validate/hint
