import { useEffect, useState, useCallback } from "react";
import { auditApi } from "~/api/auditApi";

export function useProductAuditList() {
    const [items, setItems] = useState([]);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const loadMore = useCallback(async () => {
        if (!hasMore || loading) return;

        setLoading(true);

        const res = await auditApi.getProductAuditList({
            before: cursor,
            limit: 20,
        });

        const { items: newItems, nextCursor } = res.data;

        setItems((prev) => [...prev, ...newItems]);
        setCursor(nextCursor || null);
        setHasMore(Boolean(nextCursor));
        setLoading(false);
    }, [cursor, hasMore, loading]);

    useEffect(() => {
        loadMore();
    }, []);

    return {
        items,
        loadMore,
        hasMore,
        loading,
    };
}
