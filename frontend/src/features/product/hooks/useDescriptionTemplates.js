import { useEffect, useState } from "react";
import { templateApi } from "~/api/template.api";

export default function useDescriptionTemplates() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await templateApi.getProductDescriptionTemplates();
                setTemplates(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Load description templates failed", err);
                setError(err);
                setTemplates([]);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    return { templates, loading, error };
}
