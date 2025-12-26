const SEED_ROLES = [
    { code: "ADMIN", type: "owner", priority: 100 },
    { code: "MANAGER", type: "manager", priority: 80 },
    { code: "STAFF", type: "staff", priority: 50 },
    { code: "SHIPPER", type: "shipper", priority: 30 },
    { code: "USER", type: "user", priority: 10 },
];


module.exports = { SEED_ROLES };
