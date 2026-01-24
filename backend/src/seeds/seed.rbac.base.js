// scripts/seed-permissions.js
require("dotenv").config();
const mongoose = require("mongoose");

const Permission = require("../api/v1/modules/rbac/model/permission.model");
const Role = require("../api/v1/modules/rbac/model/role.model");
const RolePermission = require("../api/v1/modules/rbac/model/rolePermission.model");

const { PERMISSION_META_LIST } = require("../constants/permissions");

async function main() {
    const uri = process.env.MONGO_DB_URL || process.env.MONGO_URI;
    if (!uri) throw new Error("Missing MONGO_DB_URL / MONGO_URI");

    const adminEmail = process.env.SEED_ADMIN_EMAIL;
    if (!adminEmail) throw new Error("Missing SEED_ADMIN_EMAIL");

    await mongoose.connect(uri);
    console.log("Connected DB:", mongoose.connection.name);

    /** 1. Seed Permission metadata */
    for (const meta of PERMISSION_META_LIST) {
        await Permission.updateOne(
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
    }

    console.log("Permissions seeded");

    /** 2. Lấy role admin */
    const adminRole = await Role.findOne({ code: "ADMIN" });
    if (!adminRole) {
        throw new Error("Admin role not found (key=admin)");
    }

    /** 3. Seed RolePermission cho admin */
    let inserted = 0;

    for (const meta of PERMISSION_META_LIST) {
        const res = await RolePermission.updateOne(
            {
                roleId: adminRole._id,
                permissionKey: meta.key,
            },
            {
                $setOnInsert: {
                    roleId: adminRole._id,
                    permissionKey: meta.key,
                    scope: "all",
                    field: null,
                },
            },
            { upsert: true }
        );

        if (res.upsertedCount === 1) inserted++;
    }

    console.log("RolePermission inserted:", inserted);
    console.log("Total permissions:", PERMISSION_META_LIST.length);

    await mongoose.disconnect();
    console.log("Done");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
