import { useState, useEffect, useMemo } from "react";
import { Empty, message, Modal, Progress, Rate, Spin } from "antd";
import {
  FaShoppingCart,
  FaHeart,
  FaTruck,
  FaShieldAlt,
  FaRegHeart,
} from "react-icons/fa";

import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductDetailBySlug,
  clearCurrentProduct,
} from "~/features/product/product_slice";
import { addToCart, fetchCart } from "../../../features/cart/cart.slice";

import { toggleWishlistLocal } from "../../../features/wishlist/wishlist.slice";
import {
  fetchFeedbacksByProduct,
  fetchProductRatingSummary,
} from "../../../features/feedback/feedback.thunk";

import FeedbackProduct from "../../../features/feedback/components/FeedbackProduct";
const ProductDetails = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [filterStar, setFilterStar] = useState(0);
  const { items } = useSelector((state) => state.wishlist);
  const { currentProduct, isLoading, error } = useSelector(
    (state) => state.product
  );
  const { feedbacks, ratingSummary, isFeedbackLoading } = useSelector(
    (state) => state.feedback
  );

  const isFavorite = items?.includes(currentProduct?._id);
  useEffect(() => {
    if (slug) {
      dispatch(fetchProductDetailBySlug(slug))
        .unwrap()
        .then((product) => {
          dispatch(
            fetchFeedbacksByProduct({
              productId: product._id,
              page: 1,
              limit: 100,
            })
          );
          dispatch(fetchProductRatingSummary(product._id));
        });
    }
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [slug, dispatch]);
  const filteredFeedbacks = useMemo(() => {
    if (filterStar === 0) return feedbacks;
    return feedbacks.filter((fb) => fb.rating === filterStar);
  }, [feedbacks, filterStar]);
  const handleAddToCart = () => {
    if (!currentProduct?._id || isAdding) return; // ✅ Chặn nếu đang add

    setIsAdding(true); // ✅ Bắt đầu trạng thái chờ

    dispatch(
      addToCart({
        product: currentProduct,
        quantity: quantity,
      })
    )
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
      .finally(() => {
        setIsAdding(false);
      });
  };
  const handleFavoriteToggle = () => {
    if (!currentProduct?._id) return;

    // Nếu sản phẩm đã có trong yêu thích -> Hiện thông báo hỏi trước khi xóa
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
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Đang tải thông tin sản phẩm..." />
      </div>
    );
  }

  if (error || !currentProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || "Không tìm thấy sản phẩm này!"}
      </div>
    );
  }

  return (
    <section className="bg-white min-h-screen pt-28 pb-10 px-4 md:px-10 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* --- CỘT TRÁI: HÌNH ẢNH --- */}
          <div className="w-full lg:w-1/2">
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <img
                src={currentProduct.image?.url} // Lấy URL từ Cloudinary
                alt={currentProduct.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-5 left-5 bg-[#c4cd38] text-white font-bold px-4 py-2 rounded-lg shadow-md">
                {currentProduct.sold > 10 ? "BÁN CHẠY" : "NEW"}
              </div>
            </div>
          </div>

          {/* --- CỘT PHẢI: THÔNG TIN --- */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 uppercase tracking-tight">
                {currentProduct.name}
              </h1>
              <div className="flex items-center gap-4">
                <Rate
                  disabled
                  value={currentProduct.rating}
                  className="text-orange-400 text-sm"
                />
                <span className="text-gray-400 text-sm">
                  (Danh mục: {currentProduct.category?.name || "Đang cập nhật"})
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-[#49a760]">
                {currentProduct.price?.toLocaleString()}đ
              </span>

              {currentProduct.oldPrice && (
                <span className="text-xl text-gray-400 line-through">
                  {currentProduct.oldPrice?.toLocaleString()}đ
                </span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed border-l-4 border-[#c4cd38] pl-4 italic">
              {currentProduct.description ||
                "Chưa có mô tả chi tiết cho sản phẩm này."}
            </p>

            <ul className="space-y-3 pt-2">
              <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <div className="size-2 rounded-full bg-[#49a760]" />
                Sản phẩm đạt chuẩn VietGAP
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <div className="size-2 rounded-full bg-[#49a760]" />
                Không chất bảo quản, cực kỳ tươi ngon
              </li>
            </ul>

            {/* Chọn số lượng & Mua ngay */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <div className="flex items-center border-2 border-gray-100 rounded-xl w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-50 text-xl"
                >
                  -
                </button>
                <span className="px-6 font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-50 text-xl"
                >
                  +
                </button>
              </div>

              <button
                disabled={isAdding}
                onClick={handleAddToCart}
                className={`flex-1 text-white font-bold uppercase py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg ${
                  isAdding
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-[#153a2e] hover:bg-[#1d4d3d] active:scale-95"
                }`}
              >
                {isAdding ? (
                  <Spin size="small" className="brightness-200" />
                ) : (
                  <FaShoppingCart />
                )}
                {isAdding ? " Đang xử lý..." : " Thêm vào giỏ hàng"}
              </button>

              <button
                onClick={handleFavoriteToggle}
                className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                  isFavorite
                    ? "border-red-500 bg-red-50 text-red-500"
                    : "border-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-400"
                }`}
              >
                {isFavorite ? (
                  <FaHeart size={20} className="text-red-500" />
                ) : (
                  <FaRegHeart size={20} />
                )}
              </button>
            </div>

            {/* Thông tin thêm (Trust Badges) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <FaTruck className="text-[#cea73d] size-6" />
                <div>
                  <p className="font-bold text-sm">Giao hàng nhanh</p>
                  <p className="text-xs text-gray-500">
                    Trong vòng 2h tại Hà Nội
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaShieldAlt className="text-[#cea73d] size-6" />
                <div>
                  <p className="font-bold text-sm">Bảo hành tươi ngon</p>
                  <p className="text-xs text-gray-500">
                    Đổi trả nếu không hài lòng
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-20 border-t pt-16">
          <h2 className="text-2xl font-black text-gray-800 uppercase mb-10">
            Khách hàng nói gì?
          </h2>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Tóm tắt sao (Bên trái) */}
            <div className="w-full lg:w-80 bg-[#153a2e] p-8 rounded-[40px] text-white shadow-xl h-fit">
              <div className="text-center mb-8">
                <div className="text-6xl font-black mb-2">
                  {currentProduct.rating}
                </div>
                <Rate
                  disabled
                  allowHalf
                  value={currentProduct.rating}
                  className="text-yellow-400"
                />
                <p className="mt-3 text-green-200 opacity-80">
                  ({ratingSummary?.totalReviews || 0} đánh giá)
                </p>
              </div>
              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-3 text-xs font-bold"
                  >
                    <span className="w-10">{s} sao</span>
                    <Progress
                      percent={
                        ratingSummary?.stars
                          ? (ratingSummary.stars[s] /
                              ratingSummary.totalReviews) *
                            100
                          : 0
                      }
                      showInfo={false}
                      strokeColor="#c4cd38"
                      trailColor="#ffffff20"
                    />
                    <span className="w-6 text-right opacity-60">
                      {ratingSummary?.stars?.[s] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Danh sách bình luận & Bộ lọc (Bên phải) */}
            <div className="flex-1 space-y-8">
              <div className="flex flex-wrap gap-3">
                {["Tất cả", "5 sao", "4 sao", "3 sao", "2 sao", "1 sao"].map(
                  (btn, i) => (
                    <button
                      key={i}
                      onClick={() => setFilterStar(i === 0 ? 0 : 6 - i)}
                      className={`px-6 py-2 rounded-xl font-bold border-2 transition-all ${
                        (i === 0 && filterStar === 0) ||
                        (i !== 0 && filterStar === 6 - i)
                          ? "bg-[#153a2e] border-[#153a2e] text-white"
                          : "bg-white border-gray-100 text-gray-500"
                      }`}
                    >
                      {btn}
                    </button>
                  )
                )}
              </div>

              {isFeedbackLoading ? (
                <div className="text-center py-10">
                  <Spin />
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredFeedbacks?.length > 0 ? (
                    filteredFeedbacks.map((fb) => (
                      <FeedbackProduct
                        key={fb._id}
                        avatar={fb.user?.image.url}
                        fullName={fb.user?.fullName}
                        rating={fb.rating}
                        createdAt={fb.createdAt}
                        comment={fb.comment}
                        images={fb.images}
                      />
                    ))
                  ) : (
                    <Empty
                      className="py-10"
                      description="Chưa có đánh giá nào."
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
