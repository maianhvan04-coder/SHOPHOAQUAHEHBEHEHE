// src/pages/admin/orders/MyStaffOrdersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  Skeleton,
  SkeletonText,
  Spacer,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { RepeatIcon, SearchIcon } from "@chakra-ui/icons";

import { getMyStaffOrdersAPI } from "~/api/order.api";
import { OrderMiniInfo, toYYYYMM } from "~/features/order/helpers/orderUi.helpers";

const STATUS_OPTIONS = ["Pending", "Processing", "Delivered", "Cancelled"];

// ===== helpers: search bỏ dấu =====
function removeDiacritics(str = "") {
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d");
}
function norm(v) {
  return removeDiacritics(String(v ?? "")).toLowerCase().trim();
}

export default function MyStaffOrdersPage() {
  const toast = useToast();
  const bg = useColorModeValue("white", "gray.900");
  const panelBg = useColorModeValue("gray.50", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");

  const [loading, setLoading] = useState(false);

  const [month, setMonth] = useState(toYYYYMM(new Date()));
  const [status, setStatus] = useState(""); // "" => all
  const [q, setQ] = useState("");
  const [orders, setOrders] = useState([]);

  const filtered = useMemo(() => {
    const key = norm(q);
    if (!key) return orders;

    return orders.filter((o) => {
      const id = norm(o?._id);

      const name =
        norm(o?.shippingAddress?.fullName) ||
        norm(o?.user?.fullName);

      const phone =
        norm(o?.shippingAddress?.phone) ||
        norm(o?.user?.phone);

      return id.includes(key) || name.includes(key) || phone.includes(key);
    });
  }, [orders, q]);

  const fetchMine = async () => {
    setLoading(true);
    try {
      const res = await getMyStaffOrdersAPI({ month, status: status || undefined });
      const data = res?.data?.data ?? res?.data;
      setOrders(Array.isArray(data) ? data : data?.data || []);
    } catch (e) {
      toast({
        status: "error",
        title: "Không tải được đơn của tôi",
        description: e?.response?.data?.message || e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, status]);

  return (
    <Box p={{ base: 3, md: 5 }}>
      {/* ===== Toolbar ===== */}
      <Card bg={bg} borderWidth="1px" borderColor={border} borderRadius="2xl">
        <CardBody>
          <Flex
            gap={3}
            align={{ base: "stretch", md: "center" }}
            direction={{ base: "column", md: "row" }}
          >
            <Box>
              <HStack spacing={3}>
                <Heading size="md">Đơn của tôi</Heading>

                <Badge colorScheme="green" borderRadius="full" px={2}>
                  {loading ? "..." : `${filtered.length}/${orders.length}`}
                </Badge>
              </HStack>

              <Text mt={1} fontSize="sm" color="gray.500">
                Quản lí đơn hàng của nhân viên
              </Text>
            </Box>

            <Spacer />

            <HStack
              w={{ base: "full", md: "auto" }}
              spacing={2}
              flexWrap="wrap"
              justify={{ base: "flex-start", md: "flex-end" }}
            >
              <Input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                w={{ base: "full", sm: "200px" }}
                bg={panelBg}
                borderColor={border}
                borderRadius="xl"
              />

              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                w={{ base: "full", sm: "220px" }}
                bg={panelBg}
                borderColor={border}
                borderRadius="xl"
              >
                <option value="">Tất cả trạng thái</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>

              <InputGroup w={{ base: "full", sm: "360px" }}>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm theo mã đơn / tên / SĐT..."
                  bg={panelBg}
                  borderColor={border}
                  borderRadius="xl"
                />
              </InputGroup>

              <Button
                leftIcon={<RepeatIcon />}
                onClick={fetchMine}
                isLoading={loading}
                loadingText="Đang tải"
                borderRadius="xl"
              >
                Làm mới
              </Button>
            </HStack>
          </Flex>
        </CardBody>
      </Card>

      <Box mt={4} />

      {/* ===== Content ===== */}
      {loading ? (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} bg={bg} borderWidth="1px" borderColor={border} borderRadius="2xl">
              <CardBody>
                <Skeleton height="16px" mb={3} />
                <SkeletonText noOfLines={5} spacing="3" />
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      ) : filtered.length === 0 ? (
        <Card bg={bg} borderWidth="1px" borderColor={border} borderRadius="2xl">
          <CardBody>
            <Text color="gray.600">Chưa có đơn nào.</Text>
          </CardBody>
        </Card>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
          {filtered.map((o) => (
            <Card
              key={o._id}
              bg={bg}
              borderWidth="1px"
              borderColor={border}
              borderRadius="2xl"
              overflow="hidden"
            >
              <CardBody>
                <Stack spacing={4}>
                  <OrderMiniInfo order={o} />
                  <Divider />
                  <Text fontSize="xs" color="gray.500">
                    * Dữ liệu đã lọc theo tháng: <b>{month}</b>
                  </Text>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
