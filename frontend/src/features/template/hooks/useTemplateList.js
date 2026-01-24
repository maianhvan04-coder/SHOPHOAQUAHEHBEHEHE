import { useEffect, useState, useCallback } from "react";
import { templateApi } from "~/api/template.api";

export function useTemplateList() {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTemplates = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await templateApi.getTemplates();

            setItems(res.data.items ?? []);
            setTotal(res.data.total ?? 0);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    return {
        items,
        total,
        loading,
        error,
        refetch: fetchTemplates,
    };
}
