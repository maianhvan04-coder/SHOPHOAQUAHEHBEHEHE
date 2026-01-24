import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { templateApi } from "~/api/template.api";
import { useNavigate } from "react-router-dom";
export function useTemplateVersionEdit(type, version) {
    const toast = useToast();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        templateApi
            .getTemplateVersion(type, version)
            .then((res) => {
                const data = res.data
                setForm({
                    type,
                    title: data.version.title,
                    intro: data.version.intro,
                    sections: data.version.sections,
                });
            });
    }, [type, version]);

    const updateField = (k, v) =>
        setForm((p) => ({ ...p, [k]: v }));

    const updateSection = (i, patch) =>
        setForm((p) => ({
            ...p,
            sections: p.sections.map((s, idx) =>
                idx === i ? { ...s, ...patch } : s
            ),
        }));

    const addSection = () =>
        setForm((p) => ({
            ...p,
            sections: [
                ...p.sections,
                {
                    key: crypto.randomUUID(),
                    title: "Tiêu đề mới",
                    content: "",
                },
            ],
        }));

    const removeSection = (i) =>
        setForm((p) => ({
            ...p,
            sections: p.sections.filter((_, idx) => idx !== i),
        }));

    const submit = async () => {
        try {
            setLoading(true);
            await templateApi.updateTemplateVersion(type, version, form);
            toast({ title: "Cập nhật version thành công", status: "success" });
            navigate(`/admin/templates/details/${type}`);
        } catch (err) {
            setErrors(err?.response?.data?.error?.details?.errors ?? {});
        } finally {
            setLoading(false);
        }
    };

    return {
        form,
        loading,
        errors,
        updateField,
        updateSection,
        addSection,
        removeSection,
        submit,
    };
}
