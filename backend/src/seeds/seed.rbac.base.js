// seeds/seed.rbac.base.js
require("dotenv").config();
const mongoose = require("mongoose");

const Permission = require("../api/v1/modules/rbac/model/permission.model");
const { PERMISSION_META_LIST } = require("../constants/permissions");

async function main() {
    const uri = process.env.MONGO_DB_URL || process.env.MONGO_URI;
    if (!uri) throw new Error("Missing MONGO_DB_URL / MONGO_URI");

    await mongoose.connect(uri);
    console.log("Connected DB:", mongoose.connection.name);

    let inserted = 0;

    for (const meta of PERMISSION_META_LIST) {
        const res = await Permission.updateOne(
            { key: meta.key },
            {
                $setOnInsert: {
                    key: meta.key,
                    resource: meta.resource,
                    action: meta.action,
                    label: meta.label,
                    groupKey: meta.groupKey,
                    groupLabel: meta.groupLabel,
                    order: meta.order ?? 0,
                    isActive: true,
                },
            },
            { upsert: true }
        );

        if (res.upsertedCount === 1) inserted++;
    }

    console.log("Permissions inserted:", inserted);
    console.log("Total meta:", PERMISSION_META_LIST.length);

    await mongoose.disconnect();
    console.log("Done");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
