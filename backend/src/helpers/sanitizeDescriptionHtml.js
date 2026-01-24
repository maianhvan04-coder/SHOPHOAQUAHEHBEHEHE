const sanitizeHtml = require("sanitize-html");

function sanitizeEditorHtml(html) {
    if (!html || typeof html !== "string") return "";

    return sanitizeHtml(html, {
        allowedTags: [
            "p",
            "br",
            "strong",
            "b",
            "i",
            "em",
            "u",
            "ul",
            "ol",
            "li",
            "blockquote",
            "h2",
            "h3",
            "h4",
            "a",
            "img",
        ],
        allowedAttributes: {
            a: ["href", "target", "rel"],
            img: ["src", "alt"],
        },
        allowedSchemes: ["http", "https", "data"],
        allowProtocolRelative: false,
        transformTags: {
            a: sanitizeHtml.simpleTransform("a", {
                rel: "noopener noreferrer",
                target: "_blank",
            }),
        },
    });
}

function sanitizeOverrides(overrides = {}) {
    const result = {};
    for (const [key, value] of Object.entries(overrides)) {
        result[key] = sanitizeEditorHtml(value);
    }
    return result;
}

module.exports = {
    sanitizeEditorHtml,
    sanitizeOverrides,
};
