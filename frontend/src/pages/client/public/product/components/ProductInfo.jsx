import { Rate, Spin } from "antd";
import {
  FaShoppingCart,
  FaHeart,
  FaRegHeart,
  FaTruck,
  FaShieldAlt,
} from "react-icons/fa";

const ProductInfo = ({
  product,
  quantity,
  setQuantity,
  isAdding,
  handleAddToCart,
  isFavorite,
  handleFavoriteToggle,
}) => {
  if (!product) return null;

  return (
    <div className="w-full lg:w-1/2 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold uppercase">
          {product.name}
        </h1>
        <div className="flex items-center gap-4">
          <Rate disabled value={product.rating} />
          <span className="text-sm text-gray-400">
            (Danh mục: {product.category?.name || "Đang cập nhật"})
          </span>
        </div>
      </div>

      <div className="flex items-baseline gap-4">
        <span className="text-3xl font-bold text-[#49a760]">
          {product.price?.toLocaleString()}đ
        </span>
        {product.oldPrice && (
          <span className="text-xl text-gray-400 line-through">
            {product.oldPrice.toLocaleString()}đ
          </span>
        )}
      </div>

      <ul className="space-y-3">
        <li className="flex items-center gap-2 text-sm">
          <span className="size-2 bg-[#49a760] rounded-full" />
          Sản phẩm đạt chuẩn VietGAP
        </li>
        <li className="flex items-center gap-2 text-sm">
          <span className="size-2 bg-[#49a760] rounded-full" />
          Không chất bảo quản, tươi ngon
        </li>
      </ul>

      {/* Quantity + Add to cart */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <div className="flex items-center border rounded-xl">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-2"
          >
            -
          </button>
          <span className="px-6 font-bold">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-4 py-2"
          >
            +
          </button>
        </div>

        <button
          disabled={isAdding}
          onClick={handleAddToCart}
          className={`flex-1 py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 ${
            isAdding
              ? "bg-gray-500"
              : "bg-[#153a2e] hover:bg-[#1d4d3d]"
          }`}
        >
          {isAdding ? <Spin size="small" /> : <FaShoppingCart />}
          {isAdding ? "Đang xử lý..." : "Thêm vào giỏ"}
        </button>

        <button
          onClick={handleFavoriteToggle}
          className={`p-4 border rounded-xl ${
            isFavorite
              ? "border-red-500 bg-red-50"
              : "border-gray-200 hover:bg-red-50"
          }`}
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>

      {/* Trust */}
      <div className="grid grid-cols-2 gap-4 pt-6 border-t">
        <div className="flex items-center gap-2">
          <FaTruck className="text-[#cea73d]" />
          <span className="text-sm">Giao hàng nhanh</span>
        </div>
        <div className="flex items-center gap-2">
          <FaShieldAlt className="text-[#cea73d]" />
          <span className="text-sm">Bảo hành tươi ngon</span>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
