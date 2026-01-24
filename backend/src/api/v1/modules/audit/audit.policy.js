exports.ROLLBACK_POLICY = {
    product: {
        allowedActions: ["update", "status", "delete"],
        allowedFields: [
            "name",
            "description",
            "image",
            "images",
            "isFeatured",
            "featuredRank",
            "isActive",
        ],
        adminOnlyFields: [
            "category",
            "price",
        ],
    },

    user: {
        allowedActions: ["update"],
        allowedFields: [
            "fullName",
            "phone",
            "isActive",
        ],
    },

    order: {
        allowedActions: ["update", "status"],
        allowedFields: [
            "status",
            "note",
        ],
    },
};
