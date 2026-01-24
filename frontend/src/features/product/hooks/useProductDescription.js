import { useEffect, useMemo, useRef, useState } from "react";

/**
 * useProductDescription – OPTION B (FINAL)
 *
 * - Template quyết định cấu trúc
 * - Product chỉ override CONTENT
 * - ❌ KHÔNG auto emit
 * - ✅ Emit CHỈ khi user thao tác
 * - ✅ Sync edit mode 1 LẦN DUY NHẤT
 */
export default function useProductDescription({
    value,
    templates = [],
    onChange,
}) {
    const didInitRef = useRef(false);

    const [templateType, setTemplateType] = useState("");
    const [templateVersion, setTemplateVersion] = useState(null);
    const [intro, setIntro] = useState("");
    const [overrides, setOverrides] = useState({});

    /* ================= INIT EDIT MODE (SYNC ONCE – NO EMIT) ================= */
    useEffect(() => {
        if (!value) return;
        if (didInitRef.current) return;
        if (!templates.length) return;

        didInitRef.current = true;

        setTemplateType(value.templateType || "");
        setTemplateVersion(value.templateVersion || null);
        setIntro(value.description || "");
        setOverrides(value.overrides || {});
    }, [value, templates]);

    /* ================= TEMPLATE ================= */
    const template = useMemo(() => {
        return templates.find((t) => t.type === templateType) || null;
    }, [templates, templateType]);

    /* ================= VERSION ================= */
    const version = useMemo(() => {
        if (!template) return null;

        return (
            template.versions.find(
                (v) => v.version === templateVersion
            ) ||
            template.versions.find(
                (v) => v.version === template.activeVersion
            ) ||
            null
        );
    }, [template, templateVersion]);

    /* ================= ACTIONS (EMIT ONLY HERE) ================= */

    const selectTemplate = (type) => {
        if (!type || !templates.length) return;

        const tpl = templates.find((t) => t.type === type);
        if (!tpl) return;

        const v =
            tpl.versions.find(
                (x) => x.version === tpl.activeVersion
            ) || tpl.versions.at(-1);

        setTemplateType(type);
        setTemplateVersion(v.version);
        setIntro(v.intro || "");
        setOverrides({});

        onChange?.({
            templateType: type,
            templateVersion: v.version,
            description: v.intro || "",
            overrides: {},
        });
    };

    const updateIntro = (val) => {
        setIntro(val);

        onChange?.({
            templateType,
            templateVersion,
            description: val,
            overrides,
        });
    };

    const updateSection = (key, val, defaultContent) => {
        const next = { ...overrides };

        // Nếu giống template → xoá override
        if (!val || val.trim() === defaultContent?.trim()) {
            delete next[key];
        } else {
            next[key] = val;
        }

        setOverrides(next);

        onChange?.({
            templateType,
            templateVersion,
            description: intro,
            overrides: next,
        });
    };

    return {
        templateType,
        templateVersion,
        intro,
        overrides,
        template,
        version,
        selectTemplate,
        updateIntro,
        updateSection,
    };
}
