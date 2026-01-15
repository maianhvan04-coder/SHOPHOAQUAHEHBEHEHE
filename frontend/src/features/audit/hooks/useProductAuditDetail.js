import { useEffect, useState } from "react";
import { auditApi } from "~/api/auditApi";

export function useProductAuditDetail(auditId) {
    const [loading, setLoading] = useState(true);
    const [audit, setAudit] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!auditId) return;

        setLoading(true);
        auditApi
            .getProductAuditDetail(auditId)
            .then((res) => {

                setAudit(res?.data?.data || null);
            })
            .catch((err) => setError(err))
            .finally(() => setLoading(false));
    }, [auditId]);

    return { loading, audit, error };
}
