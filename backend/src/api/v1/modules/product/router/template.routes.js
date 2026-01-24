const express = require("express");
const router = express.Router();
const controller = require("../controller/template.controller");
const { validate } = require("../../../middlewares/validate.middleware.js");

const { withAudit } = require("../../audit/audit.middleware");
const { RESOURCE, ACTION } = require("../constants/template.audit.constants");

const validateSchema = require("../validators/template.validator");
const templateRepo = require("../repositories/template.repository.js")
// Create Template
router.post("/create", validate(validateSchema.createTemplate),
    withAudit({
        resource: RESOURCE.TEMPLATE
        , action: ACTION.CREATE,
        getResourceId: (req) => req.body.type
        , getBefore: async () => null
        , getAfter: (req) => req.auditAfter
        , getMeta: async (req) => ({
            initialVersion: 1,
        })
    }),
    controller.createTemplate);

// Update Version
router.post("/:type/version",
    validate(validateSchema.createVersion),
    withAudit({
        resource: RESOURCE.TEMPLATE
        , action: ACTION.CREATE_VERSION,
        getResourceId: (req) => req.params.type
        , getBefore: async (req) => templateRepo.getByType(req.params.type)
        , getAfter: (req) => req.auditAfter
        , getMeta: async (req) => ({
            requestedBy: req.user.sub,
        })
    }),
    controller.createVersion);
// Update 1 version cụ thể
router.put(
    "/:type/version/:version",
    withAudit({
        resource: RESOURCE.TEMPLATE,
        action: ACTION.UPDATE,
        getResourceId: (req) =>
            `${req.params.type}:v${req.params.version}`,
        getBefore: async (req) =>
            templateRepo.findAdminDetail(
                req.params.type,
                Number(req.params.version)
            ),
        getAfter: async (req) => req.auditAfter,
    }),
    controller.updateVersion
);

router.put("/:type/activate/:version", controller.activateVersion);
// Chi tiết Template
router.get("/details/:type", controller.detail);
router.get("/", controller.listTemplate);
router.get(
    "/:type/version/:version",
    controller.getTemplateVersion
);
router.get(
    "/product-description-templates",
    controller.getAllTemplates
);

module.exports = router;
