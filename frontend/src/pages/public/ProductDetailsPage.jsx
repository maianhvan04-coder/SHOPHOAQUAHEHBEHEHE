import React, { useState, useEffect } from "react";
import { Rate, Spin } from "antd"; 
import { FaShoppingCart, FaHeart, FaTruck, FaShieldAlt } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductDetailBySlug, clearCurrentProduct } from "../../features/product/product_slice";

const ProductDetails = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);

  
  const { currentProduct, isLoading, error } = useSelector((state) => state.product);

  useEffect(() => {
    if (slug) {
      dispatch(fetchProductDetailBySlug(slug));
    }

   
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [slug, dispatch]);

  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Đang tải thông tin sản phẩm..." />
      </div>
    );
  }

  // Xử lý lỗi hoặc không tìm thấy sản phẩm
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
                <Rate disabled value={currentProduct.rating} className="text-orange-400 text-sm" />
                <span className="text-gray-400 text-sm">
                   (Danh mục: {currentProduct.category?.name || "Đang cập nhật"})
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-[#49a760]">
                {currentProduct.price?.toLocaleString()}đ
              </span>
              {/* Nếu có giá cũ thì hiện, không thì ẩn */}
              {currentProduct.oldPrice && (
                <span className="text-xl text-gray-400 line-through">
                  {currentProduct.oldPrice?.toLocaleString()}đ
                </span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed border-l-4 border-[#c4cd38] pl-4 italic">
              {currentProduct.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
            </p>

            {/* Lợi ích sản phẩm (Bạn có thể fix cứng hoặc lấy từ DB nếu có field này) */}
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
                >-</button>
                <span className="px-6 font-bold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-50 text-xl"
                >+</button>
              </div>
              
              <button className="flex-1 bg-[#153a2e] text-white font-bold uppercase py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#1d4d3d] transition-all shadow-lg active:scale-95">
                <FaShoppingCart /> Thêm vào giỏ hàng
              </button>
              
              <button className="p-4 border-2 border-gray-100 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors">
                <FaHeart size={20} />
              </button>
            </div>

            {/* Thông tin thêm (Trust Badges) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <FaTruck className="text-[#cea73d] size-6" />
                <div>
                  <p className="font-bold text-sm">Giao hàng nhanh</p>
                  <p className="text-xs text-gray-500">Trong vòng 2h tại Hà Nội</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaShieldAlt className="text-[#cea73d] size-6" />
                <div>
                  <p className="font-bold text-sm">Bảo hành tươi ngon</p>
                  <p className="text-xs text-gray-500">Đổi trả nếu không hài lòng</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;