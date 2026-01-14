import { UserOutlined } from "@ant-design/icons";
import { Avatar, Image, Rate } from "antd";
import { FaCheckCircle } from "react-icons/fa";

const FeedbackProduct = ({
  id,
  avatar,
  fullName,
  rating,
  createdAt,
  comment,
  images,
}) => {
  return (
    <>
      <div
        key={id}
        className="bg-white p-3 rounded-3xl border border-gray-100 shadow-sm"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-4 items-center">
            <Avatar
              size={50}
              src={avatar}
              icon={!avatar && <UserOutlined />}
              className="border-2 border-green-50 shadow-sm"
            />
            <div>
              <div className="font-black text-gray-800 flex items-center gap-2">
                {fullName || "Người mua hoa quả"}
                <FaCheckCircle className="text-blue-500 text-xs" />
              </div>
              <Rate
                disabled
                value={rating}
                className="text-[10px] text-orange-400"
              />
            </div>
          </div>
          <span className="text-[10px] text-gray-300 font-bold uppercase">
            {new Date(createdAt).toLocaleDateString("vi-VN")}
          </span>
        </div>
        <p className="text-gray-600 text-base leading-relaxed mb-6">
          {comment}
        </p>
        {images?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Image.PreviewGroup>
              {images.map((img, idx) => (
                <Image
                  key={idx}
                  src={img}
                  className="rounded-xl object-cover border"
                  width={100}
                  height={100}
                />
              ))}
            </Image.PreviewGroup>
          </div>
        )}
      </div>
    </>
  );
};
export default FeedbackProduct;
