// src/features/product/hooks/useProductHistory.js
import { useEffect, useState } from "react";
import { auditApi } from "~/api/auditApi";

export function useProductHistory(productId, { enabled }) {
    const [items, setItems] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const limit = 10;

    useEffect(() => {
        if (!enabled || !productId) return;

        setLoading(true);
        auditApi
            .getProductHistory(productId, { page, limit })
            .then((res) => {

                setItems(res?.data?.data.items || []);
                setPagination(res?.data?.data.pagination || null);
            })
            .finally(() => setLoading(false));
    }, [enabled, productId, page]);

    return {
        items,
        pagination,
        loading,
        page,
        setPage,
    };
}
