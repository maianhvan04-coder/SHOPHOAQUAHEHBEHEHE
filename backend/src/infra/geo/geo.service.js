// demo stub – sau có thể thay MaxMind
// Sau dùng api để check xem ở đâu
exports.resolveIpLocation = async (ip) => {
    return {
        country: "VN",
        city: "HCM",
        lat: 10.8231,
        lon: 106.6297,
    };
};

exports.calcDistanceKm = (a, b) => {
    const R = 6371;
    const dLat = deg2rad(b.lat - a.lat);
    const dLon = deg2rad(b.lon - a.lon);
    const x =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(deg2rad(a.lat)) *
        Math.cos(deg2rad(b.lat)) *
        Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
};

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
