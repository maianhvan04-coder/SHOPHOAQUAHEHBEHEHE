// src/pages/admin/orders/MyShipperOrdersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
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
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Skeleton,
  Stack,
  Text,
  useBreakpointValue,
  useColorModeValue,
  useToast,
  Link,
  Tooltip,
  Tag,
  TagLabel,
  Spacer,
} from "@chakra-ui/react";
import { RepeatIcon, SearchIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";

import {
  getMyShipperOrdersAPI,
  getShipperInboxAPI,
  shipperClaimOrderAPI,
  shipperMarkDeliveredAPI,
  shipperCancelOrderAPI,
} from "~/api/order.api";

/**
 * MODE:
 * - "my": đơn của tôi (shipper = me)
 * - "inbox": đơn chờ nhận (Confirmed, shipper=null)
 */
const MODE = "my"; // "my" | "inbox"

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Shipped", label: "Shipped (đang giao / delay)" },
  { value: "Delivered", label: "Delivered" },
  { value: "Cancelled", label: "Cancelled" },
];

function formatMoney(v) {
  const n = Number(v || 0);
  return n.toLocaleString("vi-VN") + "đ";
}
function formatDateTime(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("vi-VN");
}
function getOrderStatus(o) {
  return o?.status?.orderStatus || "Unknown";
}
function getCustomerName(o) {
  return o?.shippingAddress?.fullName || o?.user?.fullName || o?.customerName || "-";
}
function getCustomerPhone(o) {
  return o?.shippingAddress?.phone || o?.user?.phone || o?.customerPhone || "-";
}
function buildAddress(o) {
  const a = o?.shippingAddress || {};
  return [a.addressDetails, a.ward, a.province].filter(Boolean).join(", ") || "-";
}

function statusMeta(status) {
  const s = String(status || "").trim();
  if (s === "Delivered") return { scheme: "green", label: "Delivered", hint: "Đã giao" };
  if (s === "Cancelled") return { scheme: "red", label: "Cancelled", hint: "Đã huỷ" };
  if (s === "Shipped") return { scheme: "purple", label: "Shipped", hint: "Đang giao / Delay" };
  if (s === "Confirmed") return { scheme: "blue", label: "Confirmed", hint: "Đã xác nhận" };
  if (s === "Pending") return { scheme: "orange", label: "Pending", hint: "Chờ xử lý" };
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

function Pager({ page, totalPages, onPageChange, isLoading }) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <HStack justify="flex-end" spacing={2}>
      <Button
        size="sm"
        onClick={() => onPageChange(page - 1)}
        isDisabled={!canPrev || isLoading}
        variant="outline"
      >
        Trước
      </Button>
      <Tag size="sm" variant="subtle" borderRadius="full">
        <TagLabel>
          Trang <b>{page}</b> / {totalPages || 1}
        </TagLabel>
      </Tag>
      <Button
        size="sm"
        onClick={() => onPageChange(page + 1)}
        isDisabled={!canNext || isLoading}
        variant="outline"
      >
        Sau
      </Button>
    </HStack>
  );
}

/** ✅ Address block: hiển thị full, không dấu "..." */
function AddressText({ label = "Địa chỉ:", value, subtleText }) {
  return (
    <Text
      fontSize="sm"
      color={subtleText}
      mt={1}
      whiteSpace="normal"
      overflowWrap="anywhere"
      wordBreak="break-word"
    >
      <Text as="span" fontWeight="700">
        {label}
      </Text>{" "}
      {value || "-"}
    </Text>
  );
}

export default function MyShipperOrdersPage() {
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const pageBg = useColorModeValue("gray.50", "gray.950");
  const cardBg = useColorModeValue("white", "gray.900");
  const panelBg = useColorModeValue("white", "gray.900");
  const subtleText = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const linkColor = useColorModeValue("blue.600", "blue.300");

  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  });

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const params = useMemo(() => {
    const p = { page: pagination.page, limit: pagination.limit };
    if (q.trim()) p.q = q.trim();
    if (status !== "all") p.status = status;
    return p;
  }, [q, status, pagination.page, pagination.limit]);

  function normalizeResponse(res, nextPage) {
    const payload = res?.data?.data ?? res?.data ?? {};
    const listCandidate = payload.items ?? payload.results ?? payload.data ?? payload.orders ?? [];
    const list = Array.isArray(listCandidate) ? listCandidate : [];

    const pg = payload.pagination ?? payload.meta ?? {};
    const page = Number(pg.page ?? nextPage ?? 1) || 1;
    const limit = Number(pg.limit ?? pagination.limit ?? 10) || 10;
    const totalItems = Number(pg.totalItems ?? pg.total ?? list.length ?? 0) || 0;
    const totalPages = Number(pg.totalPages ?? Math.max(1, Math.ceil(totalItems / limit))) || 1;

    return { list, page, limit, totalItems, totalPages };
  }

  async function fetchData(nextPage = pagination.page) {
    setLoading(true);
    try {
      const apiCall = MODE === "my" ? getMyShipperOrdersAPI : getShipperInboxAPI;
      const res = await apiCall({ ...params, page: nextPage });

      const normalized = normalizeResponse(res, nextPage);
      setItems(normalized.list);
      setPagination((prev) => ({
        ...prev,
        page: normalized.page,
        limit: normalized.limit,
        totalItems: normalized.totalItems,
        totalPages: normalized.totalPages,
      }));
    } catch (e) {
      toast({
        status: "error",
        title: "Không tải được danh sách đơn",
        description: e?.response?.data?.error?.message || e?.message || "Lỗi không xác định",
      });
    } finally {
      setLoading(false);
    }
  }

  const canClaim = (order) => getOrderStatus(order) === "Confirmed";
  const canCancel = (order) => {
    const st = getOrderStatus(order);
    return st === "Shipped" || st === "Confirmed";
  };

  async function handleClaim(orderId) {
    if (!orderId) return;
    setActionId(orderId);
    try {
      await shipperClaimOrderAPI(orderId);
      toast({ status: "success", title: "Đã nhận đơn (Shipped)" });
      fetchData(1);
    } catch (e) {
      toast({
        status: "error",
        title: "Nhận đơn thất bại",
        description: e?.response?.data?.error?.message || e?.message || "Lỗi không xác định",
      });
    } finally {
      setActionId(null);
    }
  }

  async function handleDelivered(orderId) {
    if (!orderId) return;
    setActionId(orderId);
    try {
      await shipperMarkDeliveredAPI(orderId);
      toast({ status: "success", title: "Đã giao hàng (Delivered)" });
      fetchData(pagination.page);
    } catch (e) {
      toast({
        status: "error",
        title: "Cập nhật Delivered thất bại",
        description: e?.response?.data?.error?.message || e?.message || "Lỗi không xác định",
      });
    } finally {
      setActionId(null);
    }
  }

  async function handleCancel(orderId) {
    if (!orderId) return;
    setActionId(orderId);
    try {
      await shipperCancelOrderAPI(orderId);
      toast({ status: "success", title: "Đã huỷ đơn (Cancelled)" });
      fetchData(pagination.page);
    } catch (e) {
      toast({
        status: "error",
        title: "Huỷ đơn thất bại",
        description: e?.response?.data?.error?.message || e?.message || "Lỗi không xác định",
      });
    } finally {
      setActionId(null);
    }
  }

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const onSearch = () => fetchData(1);
  const onRefresh = () => fetchData(pagination.page);

  const onPageChange = (p) => {
    if (p < 1 || p > pagination.totalPages) return;
    fetchData(p);
  };

  const pageTitle = MODE === "my" ? "Đơn tôi đang giao" : "Inbox shipper (đơn chờ nhận)";

  const OrderActions = ({ o }) => {
    const id = o?._id;
    const st = getOrderStatus(o);
    if (!id) return null;

    if (MODE === "inbox") {
      if (!canClaim(o)) return null;
      return (
        <Button
          size="sm"
          colorScheme="blue"
          onClick={() => handleClaim(id)}
          isLoading={actionId === id}
          isDisabled={loading}
        >
          Nhận đơn
        </Button>
      );
    }

    if (st === "Shipped") {
      return (
        <HStack spacing={2} justify="flex-end">
          <Tooltip label="Đánh dấu đã giao" hasArrow>
            <Button
              size="sm"
              colorScheme="green"
              leftIcon={<CheckIcon />}
              onClick={() => handleDelivered(id)}
              isLoading={actionId === id}
              isDisabled={loading}
            >
              Đã giao
            </Button>
          </Tooltip>

          {canCancel(o) ? (
            <Tooltip label="Huỷ đơn (khi cần)" hasArrow>
              <Button
                size="sm"
                colorScheme="red"
                variant="outline"
                leftIcon={<CloseIcon />}
                onClick={() => handleCancel(id)}
                isLoading={actionId === id}
                isDisabled={loading}
              >
                Huỷ
              </Button>
            </Tooltip>
          ) : null}
        </HStack>
      );
    }

    if (st === "Confirmed" && canCancel(o)) {
      return (
        <Button
          size="sm"
          colorScheme="red"
          variant="outline"
          leftIcon={<CloseIcon />}
          onClick={() => handleCancel(id)}
          isLoading={actionId === id}
          isDisabled={loading}
        >
          Huỷ
        </Button>
      );
    }

    return null;
  };

  const HeaderKpi = () => (
    <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl" mb={4}>
      <CardBody>
        <Flex align="center" gap={3} wrap="wrap">
          <Box>
            <Heading size="md" lineHeight="1.1">
              {pageTitle}
            </Heading>
            <Text fontSize="sm" color={subtleText} mt={1}>
              Shipped = đang giao / khách delay • Delivered = giao xong • Cancelled = huỷ khi cần
            </Text>
          </Box>

          <Spacer />

          <HStack spacing={2}>
            <Tag variant="subtle" size="md" borderRadius="full">
              <TagLabel>
                Tổng: <b>{pagination.totalItems}</b> đơn
              </TagLabel>
            </Tag>

            <Tooltip label="Làm mới danh sách" hasArrow>
              <IconButton
                aria-label="Refresh"
                icon={<RepeatIcon />}
                onClick={onRefresh}
                isLoading={loading}
                variant="outline"
              />
            </Tooltip>
          </HStack>
        </Flex>
      </CardBody>
    </Card>
  );

  const Filters = () => (
    <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl" mb={4}>
      <CardBody>
        <Stack spacing={3}>
          <Flex gap={3} direction={{ base: "column", md: "row" }} align={{ md: "center" }}>
            <InputGroup flex={1}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon />
              </InputLeftElement>
              <Input
                placeholder="Tìm theo ID đơn / tên / SĐT…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
              />
            </InputGroup>

            <Select w={{ base: "100%", md: "320px" }} value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.value === "all" ? "Tất cả trạng thái" : s.label}
                </option>
              ))}
            </Select>

            <Button onClick={onSearch} isLoading={loading} colorScheme="blue">
              Tìm
            </Button>
          </Flex>

          <Divider borderColor={borderColor} />

          <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
            <Text fontSize="sm" color={subtleText}>
              Mẹo: bấm <b>Đã giao</b> để chuyển Delivered, hoặc <b>Huỷ</b> khi cần.
            </Text>
            <Pager page={pagination.page} totalPages={pagination.totalPages} onPageChange={onPageChange} isLoading={loading} />
          </Flex>
        </Stack>
      </CardBody>
    </Card>
  );

  const DesktopRow = ({ o }) => {
    const id = o?._id;
    const code = String(id || "").slice(-6);
    const st = getOrderStatus(o);
    const customer = getCustomerName(o);
    const phone = getCustomerPhone(o);
    const address = buildAddress(o);
    const total = formatMoney(o?.totalPrice);
    const created = formatDateTime(o?.createdAt);

    return (
      <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl">
        <CardBody>
          <Flex align="start" gap={4}>
            <Box minW="240px">
              <HStack spacing={2} align="center">
                <Text fontWeight="bold" fontSize="lg">
                  #{code}
                </Text>
                <StatusPill status={st} />
              </HStack>

              <Text fontSize="sm" color={subtleText} mt={1}>
                {created}
              </Text>
            </Box>

            <Box flex={1} minW={0}>
              <Text fontWeight="semibold" whiteSpace="normal" overflowWrap="anywhere" wordBreak="break-word">
                {customer} • {phone}
              </Text>

              {/* ✅ FULL ADDRESS - KHÔNG CẮT */}
              <AddressText subtleText={subtleText} value={address} />
            </Box>

            <Box textAlign="right" minW="140px">
              <Text fontWeight="bold">{total}</Text>
              <Text fontSize="sm" color={subtleText} mt={1}>
                Tổng tiền
              </Text>
            </Box>

            <Box minW="320px" textAlign="right">
              <HStack spacing={3} justify="flex-end" wrap="wrap">
                <OrderActions o={o} />
                {id ? (
                  <Link as={RouterLink} to={`/admin/order/${id}`} fontWeight="semibold" color={linkColor}>
                    Xem chi tiết
                  </Link>
                ) : (
                  <Text color="gray.400">Xem chi tiết</Text>
                )}
              </HStack>
            </Box>
          </Flex>
        </CardBody>
      </Card>
    );
  };

  const MobileCard = ({ o }) => {
    const id = o?._id;
    const code = String(id || "").slice(-6);
    const st = getOrderStatus(o);
    const customer = getCustomerName(o);
    const phone = getCustomerPhone(o);
    const address = buildAddress(o);
    const total = formatMoney(o?.totalPrice);
    const created = formatDateTime(o?.createdAt);

    return (
      <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl">
        <CardBody>
          <Stack spacing={3}>
            <Flex justify="space-between" align="start" gap={3}>
              <Box>
                <HStack spacing={2} align="center">
                  <Text fontWeight="bold" fontSize="lg">
                    #{code}
                  </Text>
                  <StatusPill status={st} />
                </HStack>

                <Text fontSize="sm" color={subtleText} mt={1}>
                  {created}
                </Text>
              </Box>

              <Button as={RouterLink} to={id ? `/admin/order/${id}` : "#"} size="sm" variant="outline" isDisabled={!id}>
                Chi tiết
              </Button>
            </Flex>

            <Box>
              <Text fontWeight="semibold" whiteSpace="normal" overflowWrap="anywhere" wordBreak="break-word">
                {customer} • {phone}
              </Text>

              {/* ✅ FULL ADDRESS - KHÔNG CẮT */}
              <AddressText subtleText={subtleText} value={address} />
            </Box>

            <Flex align="center" justify="space-between" gap={3} wrap="wrap">
              <Box>
                <Text fontSize="sm" color={subtleText}>
                  Tổng tiền
                </Text>
                <Text fontWeight="bold" fontSize="lg">
                  {total}
                </Text>
              </Box>

              <OrderActions o={o} />
            </Flex>
          </Stack>
        </CardBody>
      </Card>
    );
  };

  return (
    <Box bg={pageBg} minH="calc(100vh - 64px)" p={{ base: 3, md: 4 }}>
      <Box maxW="1200px" mx="auto">
        <HeaderKpi />
        <Filters />

        <Card bg={panelBg} border="1px solid" borderColor={borderColor} borderRadius="xl">
          <CardBody>
            {loading ? (
              <Stack spacing={3}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} height="92px" borderRadius="xl" />
                ))}
              </Stack>
            ) : items.length === 0 ? (
              <Box py={10} textAlign="center">
                <Text color={subtleText}>Chưa có đơn nào.</Text>
              </Box>
            ) : isMobile ? (
              <Stack spacing={3}>
                {items.map((o) => (
                  <MobileCard key={o?._id} o={o} />
                ))}
              </Stack>
            ) : (
              <Stack spacing={3}>
                {items.map((o) => (
                  <DesktopRow key={o?._id} o={o} />
                ))}
              </Stack>
            )}

            {!loading && items.length > 0 ? (
              <Box mt={4}>
                <Pager page={pagination.page} totalPages={pagination.totalPages} onPageChange={onPageChange} isLoading={loading} />
              </Box>
            ) : null}
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}
