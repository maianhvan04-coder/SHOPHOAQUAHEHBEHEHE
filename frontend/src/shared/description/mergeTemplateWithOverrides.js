/**
 * Merge template + product description (OPTION B)
 *
 * @param {Object} template
 * @param {Object} productDescription
 *
 * @returns {Object|null}
 */
export function mergeTemplateWithOverrides(
    template,
    productDescription
) {
    if (!template || !productDescription) return null;

    const version =
        template.versions.find(
            (v) => v.version === productDescription.templateVersion
        ) ||
        template.versions.find(
            (v) => v.version === template.activeVersion
        );

    if (!version) return null;

    return {
        intro:
            productDescription.description ||
            version.intro ||
            "",
        sections: (version.sections || []).map((s) => ({
            key: s.key,
            title: s.title,
            content:
                productDescription.overrides?.[s.key] ??
                s.content ??
                "",
        })),
    };
}
