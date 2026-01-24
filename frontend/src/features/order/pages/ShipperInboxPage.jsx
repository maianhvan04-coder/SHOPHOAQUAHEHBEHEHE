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
  IconButton,
  Skeleton,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { RepeatIcon, CheckIcon } from "@chakra-ui/icons";

import { getShipperInboxAPI, shipperClaimOrderAPI } from "~/api/order.api";

function formatMoney(v) {
  const n = Number(v || 0);
  return n.toLocaleString("vi-VN");
}

function formatDateTime(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("vi-VN");
}

function statusMeta(status) {
  const s = String(status || "").trim();
  if (s === "Confirmed") return { scheme: "blue", label: "Confirmed", hint: "Chờ shipper nhận" };
  if (s === "Shipped") return { scheme: "purple", label: "Shipped", hint: "Đang giao / delay" };
  if (s === "Delivered") return { scheme: "green", label: "Delivered", hint: "Đã giao" };
  if (s === "Cancelled") return { scheme: "red", label: "Cancelled", hint: "Đã huỷ" };
  return { scheme: "gray", label: s || "Unknown", hint: "" };
}

function StatusPill({ status }) {
  const meta = statusMeta(status);
  return (
    <HStack spacing={2}>
      <Badge colorScheme={meta.scheme} variant="subtle" px={2} py={1} borderRadius="full">
        {meta.label}
      </Badge>
      {meta.hint ? (
        <Text fontSize="xs" color="gray.500">
          {meta.hint}
        </Text>
      ) : null}
    </HStack>
  );
}

function buildAddress(addr) {
  return [addr?.addressDetails, addr?.ward, addr?.province].filter(Boolean).join(", ") || "—";
}

export default function ShipperInboxPage() {
  const toast = useToast();

  const isMobile = useBreakpointValue({ base: true, md: false });

  const pageBg = useColorModeValue("gray.50", "gray.950");
  const cardBg = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const subtleText = useColorModeValue("gray.600", "gray.300");

  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [items, setItems] = useState([]);

  const total = useMemo(() => items?.length || 0, [items]);

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const res = await getShipperInboxAPI();
      const data = res?.data?.data ?? [];
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({
        title: "Không tải được inbox",
        description: err?.response?.data?.error?.message || err?.message || "Error",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClaim = async (orderId) => {
    if (!orderId) return;
    setClaimingId(orderId);
    try {
      await shipperClaimOrderAPI(orderId);
      toast({ title: "Nhận giao thành công", status: "success" });

      // ✅ remove khỏi inbox (vì đã chuyển sang Shipped + shipper != null)
      setItems((prev) => prev.filter((x) => x?._id !== orderId));
    } catch (err) {
      toast({
        title: "Nhận giao thất bại",
        description: err?.response?.data?.error?.message || err?.message || "Error",
        status: "error",
      });
    } finally {
      setClaimingId(null);
    }
  };

  const InboxRowDesktop = ({ o }) => {
    const addr = o?.shippingAddress || {};
    const staffName = o?.staff?.fullName || "—";
    const customerName = o?.user?.fullName || addr?.fullName || "—";
    const phone = addr?.phone || "—";
    const status = o?.status?.orderStatus || "Confirmed";
    const createdAt = formatDateTime(o?.createdAt);
    const totalPrice = formatMoney(o?.totalPrice);

    return (
      <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl">
        <CardBody>
          <Flex align="start" gap={4} wrap="wrap">
            <Box flex={1} minW="260px">
              <HStack spacing={2} mb={1} align="center">
                <Text fontWeight="800" fontSize="lg" noOfLines={1}>
                  #{String(o?._id || "").slice(-6)}
                </Text>
                <StatusPill status={status} />
                <Badge colorScheme={o?.paymentMethod === "COD" ? "green" : "orange"} variant="subtle" borderRadius="full">
                  {o?.paymentMethod || "COD"}
                </Badge>
              </HStack>

              <Text fontSize="sm" color={subtleText}>
                {createdAt}
              </Text>

              <Text fontSize="sm" mt={2}>
                <b>Khách:</b> {customerName} • <b>SĐT:</b> {phone}
              </Text>

              <Text fontSize="sm" mt={1} color={subtleText}>
                <b>Staff:</b> {staffName}
              </Text>

              <Text
                fontSize="sm"
                color={subtleText}
                mt={1}
                whiteSpace="normal"
                overflowWrap="anywhere"
                wordBreak="break-word"
              >
                <Text as="span" fontWeight="700">Địa chỉ:</Text>{" "}
                {buildAddress(addr)}
              </Text>
            </Box>

            <Box minW="320px" flex={1}>
              <Flex align="center" justify="space-between" mb={2}>
                <Text fontWeight="700">Sản phẩm</Text>
                <Text fontSize="sm" color={subtleText}>
                  {o?.orderItems?.length || 0} món
                </Text>
              </Flex>

              <Stack spacing={1}>
                {(o?.orderItems || []).slice(0, 4).map((it, idx) => (
                  <Flex key={it?._id || it?.product || idx} justify="space-between" fontSize="sm" gap={3}>
                    <Text noOfLines={1} flex={1}>
                      {it?.name} <Text as="span" color={subtleText}>x {it?.quantity}</Text>
                    </Text>
                    <Text color={subtleText} whiteSpace="nowrap">
                      {formatMoney(it?.price)}đ
                    </Text>
                  </Flex>
                ))}
                {(o?.orderItems || []).length > 4 ? (
                  <Text fontSize="sm" color={subtleText}>
                    +{(o?.orderItems || []).length - 4} món nữa…
                  </Text>
                ) : null}
              </Stack>
            </Box>

            <Box minW="220px" textAlign="right">
              <Text fontSize="sm" color={subtleText}>
                Tổng tiền
              </Text>
              <Text fontSize="2xl" fontWeight="900" lineHeight="1.1">
                {totalPrice}đ
              </Text>

              <Tooltip label="Nhận đơn và chuyển sang Shipped" hasArrow>
                <Button
                  mt={3}
                  colorScheme="purple"
                  leftIcon={<CheckIcon />}
                  isLoading={claimingId === o?._id}
                  onClick={() => onClaim(o?._id)}
                  isDisabled={loading}
                >
                  Nhận giao
                </Button>
              </Tooltip>
            </Box>
          </Flex>

          <Divider my={4} borderColor={borderColor} />
          <Text fontSize="xs" color={subtleText}>
            Lưu ý: Nhận giao sẽ tự động đổi trạng thái <b>Confirmed → Shipped</b>.
          </Text>
        </CardBody>
      </Card>
    );
  };

  const InboxCardMobile = ({ o }) => {
    const addr = o?.shippingAddress || {};
    const staffName = o?.staff?.fullName || "—";
    const customerName = o?.user?.fullName || addr?.fullName || "—";
    const phone = addr?.phone || "—";
    const status = o?.status?.orderStatus || "Confirmed";
    const createdAt = formatDateTime(o?.createdAt);
    const totalPrice = formatMoney(o?.totalPrice);

    return (
      <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl">
        <CardBody>
          <Stack spacing={3}>
            <Flex justify="space-between" align="start" gap={3}>
              <Box>
                <HStack spacing={2} align="center">
                  <Text fontWeight="900" fontSize="lg">
                    #{String(o?._id || "").slice(-6)}
                  </Text>
                  <StatusPill status={status} />
                </HStack>

                <Text fontSize="sm" color={subtleText} mt={1}>
                  {createdAt}
                </Text>
              </Box>

              <Badge colorScheme={o?.paymentMethod === "COD" ? "green" : "orange"} variant="subtle" borderRadius="full">
                {o?.paymentMethod || "COD"}
              </Badge>
            </Flex>

            <Box>
              <Text fontSize="sm">
                <b>Khách:</b> {customerName} • <b>SĐT:</b> {phone}
              </Text>
              <Text fontSize="sm" color={subtleText} mt={1}>
                <b>Staff:</b> {staffName}
              </Text>
              <Text fontSize="sm" color={subtleText} mt={1} noOfLines={2}>
                <b>Địa chỉ:</b> {buildAddress(addr)}
              </Text>
            </Box>

            <Divider borderColor={borderColor} />

            <Box>
              <Flex align="center" justify="space-between" mb={2}>
                <Text fontWeight="700">Sản phẩm</Text>
                <Text fontSize="sm" color={subtleText}>
                  {o?.orderItems?.length || 0} món
                </Text>
              </Flex>

              <Stack spacing={1}>
                {(o?.orderItems || []).slice(0, 3).map((it, idx) => (
                  <Flex key={it?._id || it?.product || idx} justify="space-between" fontSize="sm" gap={3}>
                    <Text noOfLines={1} flex={1}>
                      {it?.name} <Text as="span" color={subtleText}>x {it?.quantity}</Text>
                    </Text>
                    <Text color={subtleText} whiteSpace="nowrap">
                      {formatMoney(it?.price)}đ
                    </Text>
                  </Flex>
                ))}
                {(o?.orderItems || []).length > 3 ? (
                  <Text fontSize="sm" color={subtleText}>
                    +{(o?.orderItems || []).length - 3} món nữa…
                  </Text>
                ) : null}
              </Stack>
            </Box>

            <Flex align="center" justify="space-between">
              <Box>
                <Text fontSize="sm" color={subtleText}>
                  Tổng tiền
                </Text>
                <Text fontSize="xl" fontWeight="900">
                  {totalPrice}đ
                </Text>
              </Box>

              <Button
                colorScheme="purple"
                leftIcon={<CheckIcon />}
                isLoading={claimingId === o?._id}
                onClick={() => onClaim(o?._id)}
                isDisabled={loading}
              >
                Nhận giao
              </Button>
            </Flex>
          </Stack>
        </CardBody>
      </Card>
    );
  };

  return (
    <Box bg={pageBg} minH="calc(100vh - 64px)" p={{ base: 3, md: 4 }}>
      <Box maxW="1200px" mx="auto">
        <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl" mb={4}>
          <CardBody>
            <Flex align="center" gap={3} wrap="wrap">
              <Box>
                <Heading size="md">Shipper Inbox</Heading>
                <Text fontSize="sm" color={subtleText} mt={1}>
                  Đơn đã <b>Confirmed</b>, chưa có shipper nhận
                </Text>
              </Box>

              <HStack spacing={2} ml="auto">
                <Tag variant="subtle" borderRadius="full">
                  <TagLabel>
                    <b>{total}</b> đơn
                  </TagLabel>
                </Tag>

                <Tooltip label="Tải lại danh sách" hasArrow>
                  <IconButton
                    aria-label="Reload"
                    icon={<RepeatIcon />}
                    onClick={fetchInbox}
                    isLoading={loading}
                    variant="outline"
                  />
                </Tooltip>
              </HStack>
            </Flex>
          </CardBody>
        </Card>

        <Stack spacing={3}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl">
                <CardBody>
                  <Skeleton height="22px" mb={3} borderRadius="md" />
                  <Skeleton height="16px" mb={2} borderRadius="md" />
                  <Skeleton height="16px" mb={2} borderRadius="md" />
                  <Skeleton height="16px" borderRadius="md" />
                </CardBody>
              </Card>
            ))
          ) : items.length === 0 ? (
            <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl">
              <CardBody>
                <Text color={subtleText}>Không có đơn nào đang chờ shipper nhận.</Text>
              </CardBody>
            </Card>
          ) : isMobile ? (
            items.map((o) => <InboxCardMobile key={o?._id} o={o} />)
          ) : (
            items.map((o) => <InboxRowDesktop key={o?._id} o={o} />)
          )}
        </Stack>
      </Box>
    </Box>
  );
}
