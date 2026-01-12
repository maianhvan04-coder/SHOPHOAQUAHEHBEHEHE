require("dotenv").config();
const mongoose = require("mongoose");

const User = require("../api/v1/modules/user/user.model");
const AuthProvider = require("../api/v1/modules/user/authProvider.model");

async function migrate() {
    await mongoose.connect(process.env.MONGO_DB_URL);

    const users = await User.find(
        { isDeleted: false },
        {
            passwordHash: 1,
            passwordResetTokenHash: 1,
            passwordResetExpires: 1,
            provider: 1,
            googleId: 1,
            email: 1,
        }
    ).lean();

    console.log(`🔎 Found ${users.length} users`);

    for (const u of users) {
        // ===== LOCAL =====
        if (u.passwordHash) {
            await AuthProvider.updateOne(
                { provider: "local", providerId: u.email },
                {
                    $setOnInsert: {
                        userId: u._id,
                        provider: "local",
                        providerId: u.email,
                        email: u.email,
                        passwordHash: u.passwordHash,
                        passwordResetTokenHash: u.passwordResetTokenHash,
                        passwordResetExpires: u.passwordResetExpires,
                    },
                },
                { upsert: true }
            );

            console.log(`✅ Migrated LOCAL: ${u.email}`);
        }

        // ===== GOOGLE =====
        if (u.provider === "google" && u.googleId) {
            await AuthProvider.updateOne(
                { provider: "google", providerId: u.googleId },
                {
                    $setOnInsert: {
                        userId: u._id,
                        provider: "google",
                        providerId: u.googleId,
                        email: u.email,
                    },
                },
                { upsert: true }
            );

            console.log(`✅ Migrated GOOGLE: ${u.email}`);
        }
    }

    console.log("🎉 Migration completed");
    await mongoose.disconnect();
}

migrate().catch(console.error);
