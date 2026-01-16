module.exports = function score(features) {
    let s = 0;
    if (features.geo_distance_km > 500) s += 2;
    if (features.fail_count_10m >= 3) s += 2;
    return s;
};
