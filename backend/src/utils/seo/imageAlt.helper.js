// utils/seo/imageAlt.helper.js
function normalizeText(str = "") {
    return str
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

exports.generateProductImageAlt = ({
    productName,
    categoryName,
    attributes = [],
    siteName = "Joygreen",
}) => {
    const parts = [
        productName,
        categoryName,
        ...attributes,
    ].filter(Boolean);

    return normalizeText(parts.join(" – ")) + ` | ${siteName}`;
};
