const { model, Schema, Types } = require("mongoose")


const auditSchema = new Schema({
    actorId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    resource: { type: String, required: true, index: true }, // product | order | user
    action: { type: String, required: true, index: true }, // create | update | delete | status
    resourceId: { type: Types.ObjectId, required: true, index: true },
    actorRoles: {
        type: [String],
        default: [],
    },
    changes: {
        before: { type: Schema.Types.Mixed },
        after: { type: Schema.Types.Mixed },
    },

    ip: String,
    userAgent: {
        browser: {
            name: String,
            version: String,
        },
        os: {
            name: String,
            version: String,
        },
        device: {
            type: {
                type: String, // mobile | tablet | desktop | bot
            },
            vendor: String,
            model: String,
        },
        engine: {
            name: String,
            version: String,
        },
    },
}, { timestamps: true })

auditSchema.index({ resource: 1, resourceId: 1, createdAt: -1 })
auditSchema.index({ actorId: 1, createdAt: -1 });

module.exports = model("AuditLog", auditSchema)