import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { templateApi } from "~/api/template.api";

const STORAGE_KEY = "template_create_form";

const defaultForm = {
    type: "",
    title: "",
    intro: "",
    sections: [
        {
            key: "overview",
            title: "Tổng quan",
            content: "",
        },
    ],
};

export function useTemplateCreate(initialForm) {
    const toast = useToast();
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState(() => {
        if (initialForm) return initialForm;

        const saved = sessionStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : defaultForm;
    });

    const [loading, setLoading] = useState(false);

    /* ======================
       🔥 AUTO SAVE SESSION
       ====================== */
    useEffect(() => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    }, [form]);

    /* ======================
       FORM ACTIONS
       ====================== */
    const updateField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const updateSection = (index, patch) => {
        setForm((prev) => ({
            ...prev,
            sections: prev.sections.map((s, i) =>
                i === index ? { ...s, ...patch } : s
            ),
        }));
    };

    const addSection = () => {
        setForm((prev) => ({
            ...prev,
            sections: [
                ...prev.sections,
                {
                    key: crypto.randomUUID(),
                    title: "Tiêu đề mới",
                    content: "",
                },
            ],
        }));
    };

    const removeSection = (index) => {
        setForm((prev) => ({
            ...prev,
            sections: prev.sections.filter((_, i) => i !== index),
        }));
    };

    /* ======================
       SUBMIT (CREATE)
       ====================== */
    const submit = async () => {
        const data = form;

        if (!data.type || !data.title) {
            toast({
                title: "Thiếu thông tin",
                description: "Type và Title là bắt buộc",
                status: "error",
            });
            return;
        }

        try {
            setLoading(true);
            await templateApi.createTemplate(data);

            toast({
                title: "Tạo template thành công",
                status: "success",
            });

            sessionStorage.removeItem(STORAGE_KEY);
            navigate(`/admin/templates/details/${data.type}`);
        } catch (err) {
            if (err?.response?.data?.error?.code === "VALIDATION_ERROR") {
                setErrors(err.response.data.error.details.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        form,
        loading,
        updateField,
        updateSection,
        addSection,
        removeSection,
        errors,
        submit,
    };
}
