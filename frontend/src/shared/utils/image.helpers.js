// ~/shared/utils/image.helpers.js

function build(url, transform) {
    if (!url) return "";
    return url.replace("/upload/", `/upload/${transform}/`);
}

const DEFAULT_QUALITY = "q_auto";
const DEFAULT_FORMAT = "f_auto";

export function getThumb(url, size = 240) {
    return build(
        url,
        `${DEFAULT_QUALITY},${DEFAULT_FORMAT},w_${size},h_${size},c_fill,g_auto`
    );
}

export function getImage(url, width = 1200) {
    return build(
        url,
        `${DEFAULT_QUALITY},${DEFAULT_FORMAT},w_${width},c_limit`
    );
}

export function getImageLarge(url, width = 2000) {
    return build(
        url,
        `${DEFAULT_QUALITY},${DEFAULT_FORMAT},w_${width},c_limit`
    );
}

export function getOgImage(url) {
    return build(
        url,
        `${DEFAULT_QUALITY},${DEFAULT_FORMAT},w_1200,h_630,c_fill`
    );
}
