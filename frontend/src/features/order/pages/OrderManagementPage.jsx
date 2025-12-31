import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  SearchOutlined,
  EditOutlined,
  FilterOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import {
  Table,
  Tag,
  Space,
  Input,
  Button,
  Select,
  Modal,
  Form,
  message,
  Typography,
  Card,
  Tooltip,
} from "antd";
import { fetchAllOrdersAdmin, updateStatusAdmin } from "../order.slice";
import Pagination from "../../../components/common/Pagination";

const { Title, Text } = Typography;

export default function OrderManagementPage() {
  const dispatch = useDispatch();
  const { orders, totalItems, isLoading } = useSelector((state) => state.order);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [orderIdSearch, setOrderIdSearch] = useState("");
  const [inputValue, setInputValue] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(
      fetchAllOrdersAdmin({
        page,
        limit,
        status: statusFilter,
        orderId: orderIdSearch.trim(),
      })
    );
  }, [dispatch, page, limit, statusFilter, orderIdSearch]);

  const handleSearch = () => {
    setOrderIdSearch(inputValue);
    setPage(1);
  };

  const openUpdateModal = (order) => {
    setSelectedOrder(order);
    form.setFieldsValue({
      orderStatus: order.status.orderStatus,
      shopNote: order.shopNote || "",
    });
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (values) => {
    try {
      await dispatch(
        updateStatusAdmin({
          orderId: selectedOrder._id,
          statusData: values,
        })
      ).unwrap();

      message.success("Cập nhật đơn hàng thành công");
      setIsModalOpen(false);
    } catch (err) {
      message.error(err || "Vui lòng thử lại");
    }
  };

  const getStatusTag = (status) => {
    const config = {
      Pending: { color: "orange", label: "Chờ xác nhận" },
      Confirmed: { color: "blue", label: "Đã xác nhận" },
      Shipped: { color: "purple", label: "Đang giao" },
      Delivered: { color: "green", label: "Hoàn thành" },
      Cancelled: { color: "red", label: "Đã hủy" },
    };
    const { color, label } = config[status] || {
      color: "default",
      label: status,
    };
    return (
      <Tag
        color={color}
        className="rounded-full px-3 uppercase text-[10px] font-bold"
      >
        {label}
      </Tag>
    );
  };

  const columns = [
    {
      title: "MÃ ĐƠN",
      dataIndex: "_id",
      key: "_id",
      render: (id) => (
        <Text className="font-mono font-bold text-blue-600">
          #{id.slice(-8).toUpperCase()}
        </Text>
      ),
    },
    {
      title: "KHÁCH HÀNG",
      key: "customer",
      render: (_, record) => (
        <div className="flex flex-col">
          <Text className="font-semibold text-sm">
            {record.shippingAddress?.fullName}
          </Text>
          <Text className="text-xs text-gray-400">
            {record.shippingAddress?.phone}
          </Text>
        </div>
      ),
    },
    {
      title: "TỔNG TIỀN",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) => (
        <Text className="font-bold text-red-500">
          {price?.toLocaleString()}đ
        </Text>
      ),
    },
    {
      title: "THANH TOÁN",
      dataIndex: ["status", "isPaid"],
      key: "isPaid",
      render: (isPaid) => <BadgeStatus isPaid={isPaid} />,
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: ["status", "orderStatus"],
      key: "orderStatus",
      render: (status) => getStatusTag(status),
    },
    {
      title: "HÀNH ĐỘNG",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Tooltip title="Chỉnh sửa trạng thái">
          <Button
            type="text"
            icon={<EditOutlined className="text-green-600" />}
            onClick={() => openUpdateModal(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Title
            level={2}
            className="!mb-1 !text-gray-800 flex items-center gap-2"
          >
            <ShoppingOutlined className="text-blue-500" /> Quản lý đơn hàng
          </Title>
          <Text className="text-gray-500">
            Theo dõi, kiểm tra và cập nhật tiến độ giao hàng
          </Text>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* SEARCH BAR */}
          <Input.Search
            placeholder="Tìm mã đơn hàng..."
            allowClear
            enterButton={
              <Button
                type="primary"
                className="bg-blue-600 hover:bg-blue-500 border-none px-6"
              >
                <SearchOutlined />
              </Button>
            }
            size="middle"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onSearch={handleSearch}
            className="w-full md:w-80 shadow-sm"
          />

          <Select
            placeholder="Lọc trạng thái"
            className="w-full md:w-44"
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            options={[
              { value: "", label: "Tất cả trạng thái" },
              { value: "Pending", label: "Chờ xác nhận" },
              { value: "Confirmed", label: "Đã xác nhận" },
              { value: "Shipped", label: "Đang giao" },
              { value: "Delivered", label: "Đã hoàn thành" },
              { value: "Cancelled", label: "Đã hủy" },
            ]}
          />
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="shadow-md border-none rounded-2xl overflow-hidden ">
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="_id"
          loading={isLoading}
          pagination={false}
          className="ant-table-custom"
          locale={{ emptyText: "Không tìm thấy đơn hàng nào" }}
        />

        <div className="border-t bg-gray-50">
          <Pagination
            page={page}
            limit={limit}
            totalItems={totalItems}
            onPageChange={(p) => setPage(p)}
            onLimitChange={(l) => {
              setLimit(l);
              setPage(1);
            }}
            isDisabled={isLoading}
          />
        </div>
      </div>

      {/* MODAL CẬP NHẬT */}
      <Modal
        title={<div className="pb-3 border-b text-lg">Cập nhật đơn hàng</div>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        className="rounded-2xl"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateStatus}
          className="pt-4"
        >
          <div className="flex justify-between mb-6 bg-blue-50 p-3 rounded-xl border border-blue-100">
            <Text className="text-gray-600">Mã đơn hàng:</Text>
            <Text className="font-bold text-blue-700">
              #{selectedOrder?._id.toUpperCase()}
            </Text>
          </div>

          <Form.Item
            name="orderStatus"
            label={<span className="font-bold">Trạng thái đơn hàng</span>}
          >
            <Select size="large" className="w-full">
              <Select.Option value="Pending">
                Pending (Chờ xác nhận)
              </Select.Option>
              <Select.Option value="Confirmed">
                Confirmed (Đã xác nhận)
              </Select.Option>
              <Select.Option value="Shipped">
                Shipped (Đang giao hàng)
              </Select.Option>
              <Select.Option value="Delivered">
                Delivered (Đã hoàn thành)
              </Select.Option>
              <Select.Option value="Cancelled">
                Cancelled (Hủy đơn)
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="shopNote"
            label={<span className="font-bold">Ghi chú của Shop</span>}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập ghi chú nội bộ..."
              className="rounded-xl"
            />
          </Form.Item>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              onClick={() => setIsModalOpen(false)}
              className="rounded-md"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-green-600 hover:bg-green-500 rounded-md px-8"
            >
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

// Sub-component nhỏ cho Badge thanh toán
const BadgeStatus = ({ isPaid }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
      isPaid ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        isPaid ? "bg-green-500" : "bg-gray-400"
      }`}
    />
    {isPaid ? "Đã trả" : "Chưa trả"}
  </span>
);
