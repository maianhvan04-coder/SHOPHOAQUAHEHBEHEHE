require("dotenv").config();
const mongoose = require("mongoose");

const Permission = require("../api/v1/modules/rbac/model/permission.model");
const Role = require("../api/v1/modules/rbac/model/role.model");
const RolePermission = require("../api/v1/modules/rbac/model/rolePermission.model");
const UserRole = require("../api/v1/modules/rbac/model/UserRole.model");
const User = require("../api/v1/modules/user/user.model");

const { PERMISSIONS } = require("../constants/permissions");
const { SEED_ROLES } = require("../constants/sendRoles");

async function main() {
    const uri = process.env.MONGO_DB_URL || process.env.MONGO_URI;
    if (!uri) throw new Error("Missing MONGODB_URI/MONGO_URI");

    await mongoose.connect(uri);
    console.log("Connected DB:", mongoose.connection.name);

    // 1) upsert permissions
    const keys = Object.values(PERMISSIONS);
    for (const key of keys) {
        const group = key.split(":")[0].toUpperCase();
        await Permission.updateOne(
            { key },
            { $set: { key, name: key, group, isActive: true } },
            { upsert: true }
        );
    }
    console.log("Upserted permissions:", keys.length);

    // 2) upsert roles
    for (const r of SEED_ROLES) {
        await Role.updateOne(
            { code: r.code },
            { $set: { code: r.code, name: r.code, type: r.type, priority: r.priority, isActive: true } },
            { upsert: true }
        );
    }
    console.log("Upserted roles:", SEED_ROLES.length);

    // 3) sync ADMIN = all permissions
    const adminRole = await Role.findOne({ code: "ADMIN" }).lean();
    if (!adminRole) throw new Error("ADMIN role not found");

    const perms = await Permission.find({ isActive: true }).select("_id").lean();

    await RolePermission.deleteMany({ roleId: adminRole._id });

    if (perms.length) {
        await RolePermission.insertMany(
            perms.map((p) => ({ roleId: adminRole._id, permissionId: p._id }))
        );
    }
    console.log("Synced ADMIN perms:", perms.length);

    // 4) assign ADMIN role to seed email
    const adminEmail = process.env.SEED_ADMIN_EMAIL;
    if (adminEmail) {
        const admin = await User.findOne({ email: adminEmail }).lean();
        if (!admin) {
            console.log("Admin email not found:", adminEmail);
        } else {
            await UserRole.findOneAndUpdate(
                { userId: admin._id, roleId: adminRole._id },
                { $set: { userId: admin._id, roleId: adminRole._id } },
                { upsert: true, new: true }
            );
            await User.findByIdAndUpdate(admin._id, { $inc: { authzVersion: 1 } });
            console.log("Assigned ADMIN to:", adminEmail);
        }
    }

    await mongoose.disconnect();
    console.log("Done");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
