import { useEffect, useState, useCallback } from "react";
import { auditApi } from "~/api/auditApi";

export function useSecurityAuditList(filters) {
    const [items, setItems] = useState([]);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const loadMore = useCallback(async () => {
        if (!hasMore || loading) return;

        setLoading(true);

        const res = await auditApi.getSecurityAuditList({
            before: cursor,
            limit: 20,

            search: filters?.search || undefined,
            action: filters?.action || undefined,
            riskLevel: filters?.riskLevel || undefined,
            fromDate: filters?.fromDate || undefined,
            toDate: filters?.toDate || undefined,
        });

        const { items: newItems, nextCursor } = res.data;

        setItems((prev) => [...prev, ...newItems]);
        setCursor(nextCursor || null);
        setHasMore(Boolean(nextCursor));
        setLoading(false);
    }, [cursor, hasMore, loading, filters]);

    // 🔁 reset khi filter đổi
    useEffect(() => {
        setItems([]);
        setCursor(null);
        setHasMore(true);
    }, [
        filters?.search,
        filters?.action,
        filters?.riskLevel,
        filters?.fromDate,
        filters?.toDate,
    ]);

    useEffect(() => {
        loadMore();
    }, [loadMore]);

    return {
        items,
        loadMore,
        hasMore,
        loading,
    };
}
