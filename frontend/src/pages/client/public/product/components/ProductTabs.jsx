import { Empty, Progress, Rate, Spin } from "antd";
import FeedbackProduct from "~/features/feedback/components/FeedbackProduct";

const ProductReviews = ({
  product,
  ratingSummary,
  filteredFeedbacks,
  isFeedbackLoading,
  setFilterStar,
}) => {
  if (!product) return null;

  return (
    <div className="border-t pt-16">
      <h2 className="text-2xl font-black uppercase mb-10">
        Khách hàng nói gì?
      </h2>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* SUMMARY */}
        <div className="w-full lg:w-80 bg-[#153a2e] p-8 rounded-3xl text-white">
          <div className="text-center mb-6">
            <div className="text-6xl font-black">
              {product.rating}
            </div>
            <Rate disabled value={product.rating} />
            <p className="opacity-70">
              ({ratingSummary?.totalReviews || 0} đánh giá)
            </p>
          </div>

          {[5, 4, 3, 2, 1].map((s) => (
            <div key={s} className="flex items-center gap-3 text-xs">
              <span className="w-8">{s} sao</span>
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
              />
              <span>{ratingSummary?.stars?.[s] || 0}</span>
            </div>
          ))}
        </div>

        {/* COMMENTS */}
        <div className="flex-1 space-y-6">
          <div className="flex gap-3 flex-wrap">
            {["Tất cả", "5", "4", "3", "2", "1"].map((s, i) => (
              <button
                key={i}
                onClick={() => setFilterStar(i === 0 ? 0 : Number(s))}
                className="px-5 py-2 border rounded-xl font-bold"
              >
                {s === "Tất cả" ? s : `${s} sao`}
              </button>
            ))}
          </div>

          {isFeedbackLoading ? (
            <Spin />
          ) : filteredFeedbacks?.length ? (
            filteredFeedbacks.map((fb) => (
              <FeedbackProduct key={fb._id} {...fb} />
            ))
          ) : (
            <Empty description="Chưa có đánh giá nào" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
