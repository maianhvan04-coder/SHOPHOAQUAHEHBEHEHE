import { useEffect, useState } from "react";
import { categoryApi } from "~/api/categoryApi";

export default function useProductCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await categoryApi.getForProduct();
                console.log(res)
                setCategories(res.data || []);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    return { categories, loading };
}
