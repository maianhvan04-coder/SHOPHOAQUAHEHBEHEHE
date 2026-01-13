import React, { useEffect } from "react";
import { Rate, Input, Upload, Divider, Typography, Button } from "antd";
import {
  PlusOutlined,
  CameraOutlined,
  CheckOutlined,
  EditOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { Text } = Typography;

const FeedbackTag = ({
  item,
  feedbackData,
  onChange,
  isReadonly,
  isEditMode,
  onAction,
  isSubmitting,
}) => {
  const maxImages = 6;
 
  return (
    <div
      className={`bg-white p-6 rounded-2xl border shadow-sm mb-6 transition-all ${
        isReadonly ? "opacity-90 bg-gray-50/50" : "hover:border-green-100"
      }`}
    >
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-4 items-center">
          <img
            src={item.image}
            alt={item.name}
            className="w-16 h-16 rounded-xl object-cover border border-gray-100 shadow-sm"
          />
          <div>
            <h4 className="font-bold text-xl text-[#153a2e] m-0 leading-tight">
              {item.name}
            </h4>
          </div>
        </div>
        {!isReadonly && (
          <Button
            type="primary"
            loading={isSubmitting}
            disabled={!feedbackData.comment.trim()}
            onClick={onAction}
            icon={isEditMode ? <EditOutlined /> : <CheckOutlined />}
            className={`rounded-xl font-bold h-10 ${
              isEditMode
                ? "bg-orange-500 hover:!bg-orange-600"
                : "bg-[#52c41a] hover:!bg-[#49a760]"
            } border-none shadow-md`}
          >
            {isEditMode ? "CẬP NHẬT" : "GỬI"}
          </Button>
        )}
      </div>

      <Divider className="my-4" />

      <div className="space-y-4">
        <div>
          <Text className="text-xs font-bold text-gray-500 block mb-1">
            ĐÁNH GIÁ SAO
          </Text>
          <Rate
            disabled={isReadonly}
            value={feedbackData.rating}
            onChange={(v) => onChange(item.product, "rating", v)}
            className="text-yellow-400"
          />
        </div>

        <div>
          <Text className="text-xs font-bold text-gray-500 block mb-1">
            BÌNH LUẬN
          </Text>
          <TextArea
            placeholder="Chia sẻ cảm nhận..."
            rows={3}
            readOnly={isReadonly}
            value={feedbackData.comment}
            onChange={(e) => onChange(item.product, "comment", e.target.value)}
            className={`rounded-xl border-gray-100 ${
              isReadonly
                ? "bg-transparent border-none p-0 italic text-gray-500"
                : "focus:border-green-400"
            }`}
          />
        </div>

        <div>
          <Text className="text-xs font-bold text-gray-500 block mb-2 flex items-center gap-1">
            <CameraOutlined /> HÌNH ẢNH
          </Text>
          <Upload
            listType="picture-card"
            fileList={feedbackData.fileList}
            onChange={({ fileList }) =>
              onChange(item.product, "fileList", fileList)
            }
            beforeUpload={() => false}
            multiple
            maxCount={maxImages}
            showUploadList={{ showRemoveIcon: !isReadonly }}
            openFileDialogOnClick={!isReadonly}
          >
            {!isReadonly && feedbackData.fileList?.length < maxImages && (
              <div>
                <PlusOutlined />
                <div className="mt-1 text-[10px]">Thêm ảnh</div>
              </div>
            )}
          </Upload>
        </div>
      </div>
    </div>
  );
};

export default FeedbackTag;
