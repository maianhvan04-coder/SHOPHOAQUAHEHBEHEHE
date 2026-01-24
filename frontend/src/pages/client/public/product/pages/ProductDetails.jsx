import useProductDetails from "../hooks/useProductDetails";
import ProductGallery from "../components/ProductGallery";
import ProductInfo from "../components/ProductInfo";
import ProductReviews from "../components/ProductReviews";
import ProductDescription from "~/components/product/ProductDescription";

const ProductDetails = () => {
  const state = useProductDetails();

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!state.currentProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Không tìm thấy sản phẩm
      </div>
    );
  }

  return (
    <section className="bg-white min-h-screen pt-28 pb-10 px-4 md:px-10 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* ===== TOP ===== */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          <ProductGallery
            product={state.currentProduct}
            activeImage={state.activeImage}
            setActiveImage={state.setActiveImage}
          />

          <ProductInfo
            product={state.currentProduct}
            quantity={state.quantity}
            setQuantity={state.setQuantity}
            isAdding={state.isAdding}
            handleAddToCart={state.handleAddToCart}
            isFavorite={state.isFavorite}
            handleFavoriteToggle={state.handleFavoriteToggle}
          />
        </div>

        {/* ===== TABS (GIỮ NGUYÊN GIAO DIỆN CŨ) ===== */}
        <div className="mt-20 border-b flex gap-8 text-sm font-bold uppercase">
          <button
            onClick={() => state.setActiveTab("description")}
            className={`pb-3 transition-all ${
              state.activeTab === "description"
                ? "border-b-2 border-[#153a2e] text-[#153a2e]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Mô tả
          </button>

          <button
            onClick={() => state.setActiveTab("reviews")}
            className={`pb-3 transition-all ${
              state.activeTab === "reviews"
                ? "border-b-2 border-[#153a2e] text-[#153a2e]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Đánh giá ({state.ratingSummary?.totalReviews || 0})
          </button>
        </div>

        {/* ===== TAB CONTENT ===== */}
        {state.activeTab === "description" && (
          <div className="pt-12">
            <ProductDescription
              description={state.currentProduct.description}
            />
          </div>
        )}

        {state.activeTab === "reviews" && (
          <ProductReviews
            product={state.currentProduct}
            ratingSummary={state.ratingSummary}
            filteredFeedbacks={state.filteredFeedbacks}
            isFeedbackLoading={state.isFeedbackLoading}
            setFilterStar={state.setFilterStar}
          />
        )}
      </div>
    </section>
  );
};

export default ProductDetails;
