import { useEffect, useState } from "react";

export function useTemplateVersionEditor(template, version) {
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!template) return;
        const v = template.versions.find((x) => x.version === version);
        setData(v ? JSON.parse(JSON.stringify(v)) : null);
    }, [template, version]);

    const updateField = (key, value) => {
        setData((prev) => ({ ...prev, [key]: value }));
    };

    const updateSection = (index, content) => {
        setData((prev) => {
            const sections = [...prev.sections];
            sections[index] = { ...sections[index], content };
            return { ...prev, sections };
        });
    };

    return {
        data,
        updateField,
        updateSection,
    };
}
