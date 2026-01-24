const asyncHandler = require("../../../../../core/asyncHandler");
const templateService = require("../services/template.service");
const DTO = require("../dtos/template.admin.dto")

exports.createTemplate = asyncHandler(async (req, res) => {

    const data = await templateService.createTemplate(req.body, req.user.sub)
    req.auditAfter = data;
    res.json(DTO.adminCreateTemplateDTO(data))

})

exports.listTemplate = asyncHandler(async (req, res) => {

    const data = await templateService.listTemplateAdmin(req.query, req.user.sub, req)
    // console.log(data, "Data")
    return res.json(data)
})

exports.createVersion = asyncHandler(async (req, res) => {
    console.log("Vào đến đây")
    const data = await templateService.createVersion(
        req.params.type,
        req.body,
        req.user.sub
    );
    req.auditAfter = data
    res.json(data);
})

exports.activateVersion = asyncHandler(async (req, res) => {
    const type = req.params.type;
    const version = req.params.version;

    const data = await templateService.activateVersion({ type, version })
    res.json({ data })
})

exports.detail = asyncHandler(async (req, res) => {
    const type = req.params.type;
    const data = await templateService.getTemplate({ type })

    res.json(data)
})


exports.updateVersion = asyncHandler(async (req, res) => {
    const { type, version } = req.params;

    const payload = req.body;
    const data = await templateService.updateVersion(type, version, payload, req.user.sub)
    req.auditAfter = data;

    res.json(data)
})

exports.getTemplateVersion = asyncHandler(async (req, res) => {
    const { type, version } = req.params;

    const data = await templateService.getTemplateVersion(
        type,
        version
    );

    res.json(data);
});


exports.getAllTemplates = asyncHandler(async (req, res) => {
    const data = await templateService.getAllTemplates();
    res.json(data)
})