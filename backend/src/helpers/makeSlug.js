const slugify = require("slugify");

function makeSlug(name) {
    return slugify(name, { lower: true, strict: true, locale: "vi" });
};

module.exports = {
    makeSlug
}   