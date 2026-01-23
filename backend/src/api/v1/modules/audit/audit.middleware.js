const { logAudit } = require("./audit.service");

exports.withAudit =
    ({ resource, action, getResourceId, getBefore, getAfter, getMeta }) =>
        async (req, res, next) => {
            try {
                // 1️⃣ snapshot BEFORE
                const before = getBefore ? await getBefore(req) : null;
                // 2️⃣ hook sau khi response xong
                res.on("finish", async () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        const after = getAfter ? await getAfter(req) : req.auditAfter ?? null;
                        const meta = getMeta ? await getMeta(req, res) : null;
                        await logAudit({
                            actorId: req.user.sub,
                            actorRoles: req.user.roles,
                            action,
                            resource,
                            resourceId: getResourceId(req),
                            changes: {
                                before,
                                after,
                                meta
                            },
                            req,
                        });
                    }
                });

                next();
            } catch (err) {
                next(err);
            }
        };
