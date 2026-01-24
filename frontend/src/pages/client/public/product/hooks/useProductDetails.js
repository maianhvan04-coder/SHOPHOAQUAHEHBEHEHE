import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { message, Modal } from "antd";

import {
    fetchProductDetailBySlug,
    clearCurrentProduct,
} from "~/features/product/product_slice";
import { addToCart, fetchCart } from "~/features/cart/cart.slice";
import { toggleWishlistLocal } from "~/features/wishlist/wishlist.slice";
import {
    fetchFeedbacksByProduct,
    fetchProductRatingSummary,
} from "~/features/feedback/feedback.thunk";

export default function useProductDetails() {
    const { slug } = useParams();
    const dispatch = useDispatch();

    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [filterStar, setFilterStar] = useState(0);
    const [activeTab, setActiveTab] = useState("description");
    const [activeImage, setActiveImage] = useState(null);

    const { currentProduct, isLoading, error } = useSelector(
        (state) => state.product
    );
    const { feedbacks, ratingSummary, isFeedbackLoading } = useSelector(
        (state) => state.feedback
    );
    const { items: wishlist } = useSelector((state) => state.wishlist);

    const isFavorite = wishlist?.includes(currentProduct?._id);

    // ================= FETCH PRODUCT =================
    useEffect(() => {
        if (!slug) return;

        dispatch(fetchProductDetailBySlug(slug))
            .unwrap()
            .then((product) => {
                setActiveImage(product.image?.url || product.images?.[0]?.url);

                dispatch(
                    fetchFeedbacksByProduct({
                        productId: product._id,
                        page: 1,
                        limit: 100,
                    })
                );

                dispatch(fetchProductRatingSummary(product._id));
            });

        return () => {
            dispatch(clearCurrentProduct());
        };
    }, [slug, dispatch]);

    // ================= FILTER FEEDBACK =================
    const filteredFeedbacks = useMemo(() => {
        if (filterStar === 0) return feedbacks;
        return feedbacks.filter((fb) => fb.rating === filterStar);
    }, [feedbacks, filterStar]);

    // ================= HANDLERS =================
    const handleAddToCart = () => {
        if (!currentProduct?._id || isAdding) return;

        setIsAdding(true);

        dispatch(addToCart({ product: currentProduct, quantity }))
            .unwrap()
            .then(() => {
                message.success(
                    `Đã thêm ${quantity} ${currentProduct.name} vào giỏ hàng!`
                );
            })
            .catch((err) => {
                message.error(err || "Không thể thêm vào giỏ hàng");
                dispatch(fetchCart());
            })
            .finally(() => setIsAdding(false));
    };

    const handleFavoriteToggle = () => {
        if (!currentProduct?._id) return;

        if (isFavorite) {
            Modal.confirm({
                title: "Xóa khỏi mục yêu thích?",
                content: `Bạn có chắc chắn muốn bỏ "${currentProduct.name}" khỏi danh sách yêu thích không?`,
                okText: "Đồng ý",
                okType: "danger",
                cancelText: "Hủy",
                onOk() {
                    dispatch(toggleWishlistLocal(currentProduct._id));
                },
            });
        } else {
            dispatch(toggleWishlistLocal(currentProduct._id));
        }
    };

    return {
        // state
        currentProduct,
        isLoading,
        error,
        quantity,
        isAdding,
        filterStar,
        activeTab,
        activeImage,
        isFavorite,

        // feedback
        ratingSummary,
        filteredFeedbacks,
        isFeedbackLoading,

        // setters
        setQuantity,
        setFilterStar,
        setActiveTab,
        setActiveImage,

        // actions
        handleAddToCart,
        handleFavoriteToggle,
    };
}
