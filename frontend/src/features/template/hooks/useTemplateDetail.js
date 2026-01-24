import { useEffect, useState } from "react";
import { templateApi } from "~/api/template.api";

export function useTemplateDetail(type) {
    const [template, setTemplate] = useState(null);
    const [version, setVersion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!type) return;

        let isMounted = true;

        setLoading(true);
        setError(null);
        setTemplate(null);
        setVersion(null);

        templateApi
            .detailsTemplate(type)
            .then((data) => {

                if (!isMounted) return;

                setTemplate(data);
                setVersion(data?.activeVersion ?? null);
            })
            .catch((err) => {
                if (!isMounted) return;
                setError(err);
            })
            .finally(() => {
                if (!isMounted) return;
                setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [type]);

    return {
        template,
        version,
        setVersion,
        loading,
        error,
    };
}
