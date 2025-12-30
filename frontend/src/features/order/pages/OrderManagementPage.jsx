import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  IconButton,
  Tag,
  Select,
  Textarea,
  Badge,
} from "@chakra-ui/react";
import { EditIcon, ViewIcon } from "@chakra-ui/icons";
import { fetchAllOrdersAdmin, updateStatusAdmin } from "../order.slice";

export default function OrderManagementPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { orders, isLoading } = useSelector((state) => state.order);

  // State dành cho cập nhật
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [shopNote, setShopNote] = useState("");

  useEffect(() => {
    dispatch(fetchAllOrdersAdmin({}));
  }, [dispatch]);

  const openUpdateModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status.orderStatus);
    setShopNote(order.shopNote || "");
    onOpen();
  };

  const handleUpdateStatus = async () => {
    try {
      await dispatch(
        updateStatusAdmin({
          orderId: selectedOrder._id,
          statusData: { orderStatus: newStatus, shopNote: shopNote },
        })
      ).unwrap();

      toast({
        title: "Cập nhật đơn hàng thành công",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
      onClose();
    } catch (err) {
      toast({
        title: "Lỗi cập nhật",
        description: err || "Vui lòng thử lại",
        status: "error",
        duration: 3000,
        position: "top",
      });
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "orange";
      case "Confirmed": return "blue";
      case "Shipped": return "purple";
      case "Delivered": return "green";
      case "Cancelled": return "red";
      default: return "gray";
    }
  };

  return (
    <Container maxW="7xl" py={6}>
      {/* ===== HEADER ===== */}
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="lg" color="gray.800">
            Quản lý đơn hàng
          </Heading>
          <Text mt={1} fontSize="sm" color="gray.500">
            Theo dõi và cập nhật trạng thái đơn hàng của hệ thống
          </Text>
        </Box>
      </Flex>

      {/* ===== TABLE ===== */}
      <Box bg="white" borderRadius="2xl" boxShadow="sm" borderWidth="1px">
        {isLoading ? (
          <Flex p={10} justify="center" align="center" direction="column" gap={3}>
            <Spinner color="green.500" />
            <Text color="gray.500">Đang tải danh sách đơn hàng...</Text>
          </Flex>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Mã đơn</Th>
                  <Th>Khách hàng</Th>
                  <Th>Tổng tiền</Th>
                  <Th>Thanh toán</Th>
                  <Th>Trạng thái</Th>
                  <Th textAlign="right">Hành động</Th>
                </Tr>
              </Thead>

              <Tbody>
                {orders?.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={10}>
                      Chưa có đơn hàng nào
                    </Td>
                  </Tr>
                ) : (
                  orders.map((order) => (
                    <Tr key={order._id} _hover={{ bg: "gray.50" }}>
                      <Td fontWeight="bold" fontSize="xs">
                        #{order._id.slice(-8).toUpperCase()}
                      </Td>
                      <Td>
                        <Text fontWeight="semibold" fontSize="sm">{order.shippingAddress?.fullName}</Text>
                        <Text fontSize="xs" color="gray.500">{order.shippingAddress?.phone}</Text>
                      </Td>
                      <Td fontWeight="bold" color="red.500">
                        {order.totalPrice?.toLocaleString()}đ
                      </Td>
                      <Td>
                        <Badge colorScheme={order.status?.isPaid ? "green" : "gray"}>
                          {order.status?.isPaid ? "Đã trả" : "Chưa trả"}
                        </Badge>
                      </Td>
                      <Td>
                        <Tag size="sm" variant="solid" colorScheme={getStatusColor(order.status?.orderStatus)}>
                          {order.status?.orderStatus}
                        </Tag>
                      </Td>
                      <Td textAlign="right">
                        <HStack justify="flex-end" spacing={2}>
                          <IconButton
                            aria-label="Cập nhật"
                            icon={<EditIcon />}
                            size="sm"
                            colorScheme="green"
                            variant="ghost"
                            onClick={() => openUpdateModal(order)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      {/* ===== MODAL CẬP NHẬT TRẠNG THÁI ===== */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent borderRadius="2xl">
          <ModalHeader borderBottomWidth="1px">Cập nhật đơn hàng</ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <HStack mb={4} justify="space-between">
              <Text fontSize="sm" color="gray.500">Mã đơn:</Text>
              <Text fontWeight="bold">#{selectedOrder?._id.toUpperCase()}</Text>
            </HStack>

            <Box mb={4}>
              <Text fontSize="sm" fontWeight="bold" mb={2}>Trạng thái đơn hàng</Text>
              <Select 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value)}
                borderRadius="xl"
              >
                <option value="Pending">Pending (Chờ xác nhận)</option>
                <option value="Confirmed">Confirmed (Đã xác nhận)</option>
                <option value="Shipped">Shipped (Đang giao hàng)</option>
                <option value="Delivered">Delivered (Đã hoàn thành)</option>
                <option value="Cancelled">Cancelled (Hủy đơn)</option>
              </Select>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="bold" mb={2}>Ghi chú của Shop (Nội bộ)</Text>
              <Textarea
                placeholder="Ví dụ: Đã gọi điện xác nhận, khách đổi sang táo xanh..."
                value={shopNote}
                onChange={(e) => setShopNote(e.target.value)}
                borderRadius="xl"
                fontSize="sm"
              />
            </Box>
          </ModalBody>

          <ModalFooter borderTopWidth="1px">
            <Button variant="ghost" mr={3} onClick={onClose}>
              Đóng
            </Button>
            <Button colorScheme="green" px={8} onClick={handleUpdateStatus}>
              Lưu thay đổi
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}