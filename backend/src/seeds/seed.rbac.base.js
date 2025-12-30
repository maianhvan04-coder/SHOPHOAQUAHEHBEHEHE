// scripts/seed-permissions.js
// ✅ Seed Permission tiếng Việt vào DB (upsert từ PERMISSION_META_LIST)
// Chạy: node scripts/seed-permissions.js

require("dotenv").config();
const mongoose = require("mongoose");

const Permission = require("../api/v1/modules/rbac/model/permission.model"); // sửa path đúng project bạn
const { PERMISSION_META_LIST } = require("../constants/permissions");     // sửa path đúng project bạn

async function main() {
    const uri = process.env.MONGO_DB_URL || process.env.MONGO_URI;
    if (!uri) throw new Error("Missing MONGO_DB_URL/MONGO_URI");

    await mongoose.connect(uri);
    console.log("Connected DB:", mongoose.connection.name);

    let upserted = 0;

    for (const meta of PERMISSION_META_LIST) {
        const doc = {
            key: meta.key,
            resource: meta.resource,
            action: meta.action,
            label: meta.label,
            groupKey: meta.groupKey,
            groupLabel: meta.groupLabel,
            order: meta.order ?? 0,
            isActive: true,
        };

        const res = await Permission.updateOne(
            { key: meta.key },
            { $set: doc },
            { upsert: true }
        );

        if (res.upsertedCount || res.modifiedCount) upserted += 1;
    }

    console.log("Permissions upserted/updated:", upserted);
    console.log("Total meta:", PERMISSION_META_LIST.length);

    await mongoose.disconnect();
    console.log("Done");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
