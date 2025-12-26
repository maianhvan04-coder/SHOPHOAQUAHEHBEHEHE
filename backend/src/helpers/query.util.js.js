exports.parsePagination = (query, { defaultLimit = 10, maxLimit = 100 } = {}) => {
    let { page = 1, limit = defaultLimit } = query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (Number.isNaN(page) || page < 1) page = 1;
    if (Number.isNaN(limit) || limit < 1) limit = defaultLimit;
    if (limit > maxLimit) limit = maxLimit;

    return { page, limit, skip: (page - 1) * limit };
};

exports.parseBoolean = (v) => {
    if (v === "true") return true;
    if (v === "false") return false;
    return undefined;
};
