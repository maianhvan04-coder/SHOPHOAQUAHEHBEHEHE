// src/pages/admin/orders/OrderInboxPage.jsx
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

import { claimOrderAPI, getUnassignedOrdersAPI } from "~/api/order.api";
import { OrderMiniInfo } from "~/features/order/helpers/orderUi.helpers";

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

export default function OrderInboxPage() {
  const toast = useToast();
  const bg = useColorModeValue("white", "gray.900");
  const panelBg = useColorModeValue("gray.50", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");

  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState(null);

  const [status, setStatus] = useState("Pending");
  const [q, setQ] = useState("");
  const [orders, setOrders] = useState([]);

  const filtered = useMemo(() => {
    const key = norm(q);
    if (!key) return orders;

    return orders.filter((o) => {
      const id = norm(o?._id);

      // ưu tiên tên/SĐT từ shippingAddress (vì inbox thường không populate user)
      const name =
        norm(o?.shippingAddress?.fullName) ||
        norm(o?.user?.fullName);

      const phone =
        norm(o?.shippingAddress?.phone) ||
        norm(o?.user?.phone);

      return id.includes(key) || name.includes(key) || phone.includes(key);
    });
  }, [orders, q]);

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const res = await getUnassignedOrdersAPI({ status });
      const data = res?.data?.data ?? res?.data;
      setOrders(Array.isArray(data) ? data : data?.data || []);
    } catch (e) {
      toast({
        status: "error",
        title: "Không tải được inbox",
        description: e?.response?.data?.message || e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const onClaim = async (orderId) => {
    setClaimingId(orderId);
    try {
      await claimOrderAPI(orderId);
      toast({ status: "success", title: "Nhận đơn thành công" });
      await fetchInbox();
    } catch (e) {
      toast({
        status: "error",
        title: "Claim thất bại",
        description: e?.response?.data?.message || e.message,
      });
    } finally {
      setClaimingId(null);
    }
  };

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
                <Heading size="md">Inbox (Chưa gán)</Heading>

                <Badge colorScheme="blue" borderRadius="full" px={2}>
                  {loading ? "..." : `${filtered.length}/${orders.length}`}
                </Badge>
              </HStack>

              <Text mt={1} fontSize="sm" color="gray.500">
                Danh sách đơn chưa có staff nhận (claim)
              </Text>
            </Box>

            <Spacer />

            <HStack
              w={{ base: "full", md: "auto" }}
              spacing={2}
              flexWrap="wrap"
              justify={{ base: "flex-start", md: "flex-end" }}
            >
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                size="md"
                w={{ base: "full", sm: "200px" }}
                bg={panelBg}
                borderColor={border}
                borderRadius="xl"
              >
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
                onClick={fetchInbox}
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
                <SkeletonText noOfLines={4} spacing="3" />
                <Divider my={4} />
                <Skeleton height="40px" borderRadius="xl" />
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      ) : filtered.length === 0 ? (
        <Card bg={bg} borderWidth="1px" borderColor={border} borderRadius="2xl">
          <CardBody>
            <Text color="gray.600">Không có đơn phù hợp.</Text>
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

                  <Button
                    colorScheme="blue"
                    borderRadius="xl"
                    onClick={() => onClaim(o._id)}
                    isLoading={claimingId === o._id}
                    loadingText="Đang nhận..."
                    isDisabled={!!claimingId && claimingId !== o._id}
                  >
                    Claim đơn
                  </Button>

                  <Text fontSize="xs" color="gray.500">
                    * Chỉ claim được khi đơn còn Pending và chưa có staff.
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
