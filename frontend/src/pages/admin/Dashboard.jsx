// src/pages/admin/Dashboard.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardBody,
  Circle,
  SimpleGrid,
  Stack,
  HStack,
  Text,
  Badge,
  Tooltip,
  VStack,
  Input,
  Button,
  Spinner,
  Divider,
  Switch,
  FormControl,
  FormLabel,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Checkbox,
} from "@chakra-ui/react";
import {
  UsersIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  XCircleIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import PageHeader from "~/components/layout/admin/PageHeader";
import { getDashboardMonthAPI, getDashboardYearAPI } from "~/api/order.api";

function currentMonthStr() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${m}`;
}

function prevMonthStr(yyyyMM) {
  const [y, m] = String(yyyyMM || "").split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  d.setUTCMonth(d.getUTCMonth() - 1);
  const yy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
}

function pctChange(cur, prev) {
  const c = Number(cur || 0);
  const p = Number(prev || 0);
  if (p <= 0) return 0;
  return Math.round(((c - p) / p) * 100);
}

function fmtMoney(n) {
  return Number(n || 0).toLocaleString("vi-VN");
}

function fmtVND(n) {
  return `${fmtMoney(n)} ₫`;
}

function toDayLabel(yyyyMMdd) {
  if (!yyyyMMdd) return "";
  const parts = String(yyyyMMdd).split("-");
  return parts[2] || yyyyMMdd;
}

function toMonthLabel(yyyyMM) {
  if (!yyyyMM) return "";
  const parts = String(yyyyMM).split("-");
  return parts[1] || yyyyMM;
}

function normalizeRole(r) {
  if (!r) return "";
  if (typeof r === "string") return r.toUpperCase();
  if (typeof r === "object" && r.code) return String(r.code).toUpperCase();
  return String(r).toUpperCase();
}

function statusMeta(status) {
  const s = String(status || "").toUpperCase();
  if (s === "DELIVERED") return { label: "Delivered", scheme: "green" };
  if (s === "PENDING") return { label: "Pending", scheme: "orange" };
  if (s === "CANCELLED") return { label: "Cancelled", scheme: "red" };
  if (s === "SHIPPED" || s === "SHIPPING") return { label: "Shipped", scheme: "blue" };
  if (s === "CONFIRMED") return { label: "Confirmed", scheme: "purple" };
  return { label: status || "Unknown", scheme: "gray" };
}

function KpiCard({ title, value, icon, trend, helpText, scheme, isMoney }) {
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  const muted = useColorModeValue("gray.600", "gray.400");

  const iconBg = useColorModeValue(`${scheme}.50`, `${scheme}.900`);
  const iconColor = useColorModeValue(`${scheme}.600`, `${scheme}.200`);

  const trendColor = trend > 0 ? "green.500" : trend < 0 ? "red.500" : muted;

  return (
    <Card
      bg={bg}
      border="1px solid"
      borderColor={border}
      rounded="2xl"
      shadow="sm"
      transition="all 0.15s ease"
      _hover={{ shadow: "md", transform: "translateY(-1px)" }}
    >
      <CardBody>
        <HStack align="start" justify="space-between" spacing={3}>
          <Stack spacing={2} flex={1} minW={0}>
            <Stat>
              <StatLabel color={muted} fontSize="sm" noOfLines={1}>
                {title}
              </StatLabel>

              <StatNumber
                fontSize="2xl"
                letterSpacing="-0.5px"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                lineHeight="1.1"
                fontVariantNumeric="tabular-nums"
              >
                {isMoney ? fmtVND(value) : String(value ?? 0)}
              </StatNumber>

              <StatHelpText mb={0} color={muted}>
                <HStack spacing={2} flexWrap="nowrap">
                  <Text color={trendColor} fontWeight="semibold" whiteSpace="nowrap">
                    <StatArrow type={trend >= 0 ? "increase" : "decrease"} />
                    {Math.abs(trend)}%
                  </Text>
                  <Text whiteSpace="nowrap">{helpText}</Text>
                </HStack>
              </StatHelpText>
            </Stat>
          </Stack>

          <Circle size="44px" bg={iconBg} color={iconColor} flexShrink={0}>
            <Box as={icon} width="22px" height="22px" />
          </Circle>
        </HStack>
      </CardBody>
    </Card>
  );
}

function PanelCard({ title, subtitle, right, children }) {
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  const muted = useColorModeValue("gray.600", "gray.400");

  return (
    <Card bg={bg} border="1px solid" borderColor={border} rounded="2xl" shadow="sm">
      <CardBody>
        <HStack justify="space-between" align="start" mb={4}>
          <Box>
            <Text fontSize="lg" fontWeight="semibold">
              {title}
            </Text>
            {subtitle ? (
              <Text fontSize="sm" color={muted} mt={0.5}>
                {subtitle}
              </Text>
            ) : null}
          </Box>
          {right}
        </HStack>

        {children}
      </CardBody>
    </Card>
  );
}

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const rolesRaw = JSON.parse(localStorage.getItem("roles") || "[]");
  const roles = rolesRaw.map(normalizeRole);
  const isAdmin = roles.includes("ADMIN") || roles.includes("ROLE_ADMIN");

  const textMuted = useColorModeValue("gray.600", "gray.300");
  const borderSoft = useColorModeValue("gray.200", "whiteAlpha.200");

  const tooltipBg = useColorModeValue("white", "gray.800");
  const tooltipBorder = borderSoft;
  const barTrackBg = useColorModeValue("gray.100", "whiteAlpha.100");
  const statusShade = useColorModeValue("400", "300");

  const [month, setMonth] = useState(currentMonthStr());

  // chế độ xem 1 staff (admin)
  const [staffId, setStaffId] = useState("");

  // compare nhiều staff (admin)
  const [compare, setCompare] = useState(false);
  const [compareSearch, setCompareSearch] = useState("");
  const [selectedStaffIds, setSelectedStaffIds] = useState([]); // [] = tất cả

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [curData, setCurData] = useState(null);
  const [prevData, setPrevData] = useState(null);

  // year chart
  const [yearLoading, setYearLoading] = useState(false);
  const [yearErr, setYearErr] = useState("");
  const [yearData, setYearData] = useState(null);

  // ✅ tránh “vừa staffId vừa compare” gây hiểu nhầm
  useEffect(() => {
    if (compare && staffId) setStaffId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compare]);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");

    setYearLoading(true);
    setYearErr("");

    try {
      const prevMonth = prevMonthStr(month);

      const paramsCur = {
        month,
        ...(isAdmin && !compare && staffId ? { staffId } : {}),
        ...(isAdmin && compare ? { compare: "1" } : {}),
      };

      const paramsPrev = {
        month: prevMonth,
        ...(isAdmin && !compare && staffId ? { staffId } : {}),
      };

      const y = String(month || "").slice(0, 4);
      const paramsYear = {
        year: y,
        ...(isAdmin && !compare && staffId ? { staffId } : {}),
      };

      const [curRes, prevRes, yearRes] = await Promise.all([
        getDashboardMonthAPI(paramsCur),
        getDashboardMonthAPI(paramsPrev),
        compare ? Promise.resolve(null) : getDashboardYearAPI(paramsYear),
      ]);

      const curPayload = curRes?.data?.data ?? curRes?.data ?? null;
      const prevPayload = prevRes?.data?.data ?? prevRes?.data ?? null;
      const yearPayload = yearRes ? (yearRes?.data?.data ?? yearRes?.data ?? null) : null;

      setCurData(curPayload);
      setPrevData(prevPayload);
      setYearData(yearPayload);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Lỗi tải dashboard";
      setErr(msg);
      setYearErr(msg);
    } finally {
      setLoading(false);
      setYearLoading(false);
    }
  }, [month, staffId, compare, isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const kpi = curData?.kpi || {};
  const kpiPrev = prevData?.kpi || {};

  const revenueTrend = pctChange(kpi.revenue, kpiPrev.revenue);
  const totalTrend = pctChange(kpi.ordersTotal, kpiPrev.ordersTotal);
  const successTrend = pctChange(kpi.ordersSuccess, kpiPrev.ordersSuccess);
  const aovTrend = pctChange(kpi.aov, kpiPrev.aov);
  const customerTrend = pctChange(kpi.uniqueCustomers, kpiPrev.uniqueCustomers);
  const cancelledTrend = pctChange(kpi.ordersCancelled, kpiPrev.ordersCancelled);

  const revenueByDay = useMemo(() => curData?.revenueByDay || [], [curData]);
  const ordersByStatus = useMemo(() => curData?.ordersByStatus || [], [curData]);
  const compareByStaff = useMemo(() => curData?.compareByStaff || [], [curData]);

  const revenueByMonth = useMemo(() => yearData?.revenueByMonth || [], [yearData]);
  const yearTotalRevenue = yearData?.totalRevenue ?? 0;

  const singlePoint = revenueByDay.length === 1;

  const chartTooltip = useCallback(
    ({ active, payload, label }) => {
      if (!active || !payload?.length) return null;
      const v = payload[0]?.value ?? 0;
      return (
        <Box
          bg={tooltipBg}
          border="1px solid"
          borderColor={tooltipBorder}
          rounded="lg"
          px={3}
          py={2}
          shadow="md"
        >
          <Text fontSize="xs" color={textMuted}>
            Ngày {label}
          </Text>
          <Text fontSize="sm" fontWeight="semibold">
            Doanh thu: {fmtVND(v)}
          </Text>
        </Box>
      );
    },
    [tooltipBg, tooltipBorder, textMuted]
  );

  const yearTooltip = useCallback(
    ({ active, payload, label }) => {
      if (!active || !payload?.length) return null;
      const v = payload[0]?.value ?? 0;
      return (
        <Box
          bg={tooltipBg}
          border="1px solid"
          borderColor={tooltipBorder}
          rounded="lg"
          px={3}
          py={2}
          shadow="md"
        >
          <Text fontSize="xs" color={textMuted}>
            Tháng {toMonthLabel(label)}
          </Text>
          <Text fontSize="sm" fontWeight="semibold">
            Doanh thu: {fmtVND(v)}
          </Text>
        </Box>
      );
    },
    [tooltipBg, tooltipBorder, textMuted]
  );

  // ====== compare UI helpers ======
  const compareOptions = useMemo(() => {
    const q = compareSearch.trim().toLowerCase();
    if (!q) return compareByStaff;
    return compareByStaff.filter((x) => String(x._id).toLowerCase().includes(q));
  }, [compareByStaff, compareSearch]);

  const compareRows = useMemo(() => {
    if (!compare) return compareByStaff;
    if (!selectedStaffIds.length) return compareByStaff;
    const setIds = new Set(selectedStaffIds.map(String));
    return compareByStaff.filter((x) => setIds.has(String(x._id)));
  }, [compare, compareByStaff, selectedStaffIds]);

  const selectedCountLabel = useMemo(() => {
    if (!compare) return "";
    if (!selectedStaffIds.length) return "All staff";
    return `${selectedStaffIds.length} selected`;
  }, [compare, selectedStaffIds]);

  const toggleStaff = (id, checked) => {
    const sid = String(id);
    setSelectedStaffIds((prev) => {
      if (checked) return prev.includes(sid) ? prev : [...prev, sid];
      return prev.filter((x) => x !== sid);
    });
  };

  const selectAllVisible = () => {
    setSelectedStaffIds((prev) => {
      const set = new Set(prev.map(String));
      for (const x of compareOptions) set.add(String(x._id));
      return Array.from(set);
    });
  };

  const clearAll = () => setSelectedStaffIds([]);

  const yearStr = String(month || "").slice(0, 4);

  return (
    <Box p={{ base: 4, md: 8 }}>
      <PageHeader
        title="Dashboard đơn hàng"
        description={`Welcome back, ${user?.name || user?.fullName || "User"}`}
      />

      {/* FILTER BAR */}
      <Card border="1px solid" borderColor={borderSoft} rounded="2xl" shadow="sm" mb={6}>
        <CardBody>
          <Stack direction={{ base: "column", lg: "row" }} spacing={4} justify="space-between">
            <HStack spacing={4} flexWrap="wrap" align="end">
              <Box>
                <Text fontSize="sm" color={textMuted} mb={1}>
                  Chọn tháng
                </Text>
                <Input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  maxW="220px"
                />
              </Box>

              {isAdmin ? (
                <Box opacity={compare ? 0.5 : 1} pointerEvents={compare ? "none" : "auto"}>
                  <Text fontSize="sm" color={textMuted} mb={1}>
                    StaffId (optional) — xem riêng 1 staff
                  </Text>
                  <Input
                    placeholder="VD: 65xxxx..."
                    value={staffId}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      setStaffId(v);
                      if (v) setCompare(false);
                    }}
                    maxW="340px"
                  />
                </Box>
              ) : null}

              {isAdmin ? (
                <FormControl display="flex" alignItems="center" w="auto">
                  <FormLabel mb="0" fontSize="sm" color={textMuted}>
                    Compare staff
                  </FormLabel>
                  <Switch
                    isChecked={compare}
                    onChange={(e) => {
                      const on = e.target.checked;
                      setCompare(on);
                      if (!on) {
                        setCompareSearch("");
                        setSelectedStaffIds([]);
                      }
                    }}
                  />
                </FormControl>
              ) : null}
            </HStack>

            <HStack justify={{ base: "flex-start", lg: "flex-end" }} spacing={3}>
              <Badge
                colorScheme={isAdmin ? "purple" : "green"}
                variant="subtle"
                rounded="full"
                px={3}
                py={1}
              >
                {isAdmin ? "ADMIN" : "STAFF"}
              </Badge>

              {loading ? <Spinner size="sm" /> : null}

              <Button onClick={load} size="sm" variant="outline" isLoading={loading}>
                Refresh
              </Button>
            </HStack>
          </Stack>

          {/* compare picker */}
          {isAdmin && compare ? (
            <Box mt={4}>
              <HStack justify="space-between" mb={2} flexWrap="wrap" gap={2}>
                <Text fontSize="sm" color={textMuted}>
                  Chọn staff để xem: <b>{selectedCountLabel}</b> (không chọn ai = tất cả)
                </Text>

                <HStack spacing={2}>
                  <Button size="xs" variant="outline" onClick={selectAllVisible}>
                    Select visible
                  </Button>
                  <Button size="xs" variant="outline" onClick={clearAll}>
                    Clear
                  </Button>
                </HStack>
              </HStack>

              <HStack spacing={3} align="start" flexWrap="wrap">
                <Box flex="1" minW={{ base: "100%", md: "340px" }}>
                  <Input
                    placeholder="Search staffId..."
                    value={compareSearch}
                    onChange={(e) => setCompareSearch(e.target.value)}
                  />
                </Box>

                <Box
                  flex="2"
                  minW={{ base: "100%", md: "520px" }}
                  border="1px solid"
                  borderColor={borderSoft}
                  rounded="xl"
                  p={3}
                  maxH="180px"
                  overflow="auto"
                >
                  {compareOptions.length ? (
                    <Stack spacing={2}>
                      {compareOptions.map((x) => {
                        const id = String(x._id);
                        return (
                          <HStack key={id} justify="space-between">
                            <Checkbox
                              isChecked={selectedStaffIds.includes(id)}
                              onChange={(e) => toggleStaff(id, e.target.checked)}
                            >
                              <Text fontFamily="mono" fontSize="xs">
                                {id}
                              </Text>
                            </Checkbox>
                            <Text fontSize="xs" color={textMuted} whiteSpace="nowrap">
                              {fmtVND(x.revenue || 0)}
                            </Text>
                          </HStack>
                        );
                      })}
                    </Stack>
                  ) : (
                    <Text fontSize="sm" color={textMuted}>
                      Không tìm thấy staff phù hợp
                    </Text>
                  )}
                </Box>
              </HStack>
            </Box>
          ) : null}

          {err ? (
            <Box mt={4}>
              <Badge colorScheme="red" rounded="md" px={3} py={1}>
                {err}
              </Badge>
            </Box>
          ) : (
            <Text mt={3} fontSize="sm" color={textMuted}>
              Rule doanh thu: COD = Delivered, non-COD = Paid
            </Text>
          )}
        </CardBody>
      </Card>

      {/* KPI */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 6 }} spacing={5} mb={6}>
        <Tooltip label="Doanh thu tháng" hasArrow>
          <Box>
            <KpiCard
              title="Doanh thu"
              value={kpi.revenue || 0}
              icon={CurrencyDollarIcon}
              trend={revenueTrend}
              helpText="vs last month"
              scheme="green"
              isMoney
            />
          </Box>
        </Tooltip>

        <Tooltip label="Tổng số đơn trong tháng" hasArrow>
          <Box>
            <KpiCard
              title="Tổng đơn"
              value={kpi.ordersTotal || 0}
              icon={ChartBarIcon}
              trend={totalTrend}
              helpText="vs last month"
              scheme="blue"
            />
          </Box>
        </Tooltip>

        <Tooltip label="Đơn thành công" hasArrow>
          <Box>
            <KpiCard
              title="Đơn thành công"
              value={kpi.ordersSuccess || 0}
              icon={ShieldCheckIcon}
              trend={successTrend}
              helpText="vs last month"
              scheme="purple"
            />
          </Box>
        </Tooltip>

        <Tooltip label="AOV = revenue / ordersSuccess" hasArrow>
          <Box>
            <KpiCard
              title="AOV"
              value={Math.round(kpi.aov || 0)}
              icon={ArrowTrendingUpIcon}
              trend={aovTrend}
              helpText="vs last month"
              scheme="orange"
              isMoney
            />
          </Box>
        </Tooltip>

        <Tooltip label="Khách hàng unique trong tháng" hasArrow>
          <Box>
            <KpiCard
              title="Khách unique"
              value={kpi.uniqueCustomers || 0}
              icon={UsersIcon}
              trend={customerTrend}
              helpText="vs last month"
              scheme="teal"
            />
          </Box>
        </Tooltip>

        <Tooltip label="Số đơn huỷ trong tháng" hasArrow>
          <Box>
            <KpiCard
              title="Đơn huỷ"
              value={kpi.ordersCancelled || 0}
              icon={XCircleIcon}
              trend={cancelledTrend}
              helpText="vs last month"
              scheme="red"
            />
          </Box>
        </Tooltip>
      </SimpleGrid>

      {/* YEAR CHART */}
      <PanelCard
        title="Tổng doanh thu theo tháng (1 năm)"
        subtitle={`Năm ${yearStr} • Jan → Dec`}
        right={
          <Badge colorScheme="green" variant="subtle" rounded="full">
            YEAR
          </Badge>
        }
      >
        {isAdmin && compare ? (
          <Center h="220px" border="1px dashed" borderColor={borderSoft} rounded="xl">
            <Text fontSize="sm" color={textMuted}>
              Tắt “Compare staff” để xem biểu đồ doanh thu theo năm.
            </Text>
          </Center>
        ) : (
          <>
            <Box h="320px" minW={0}>
              {yearLoading ? (
                <Center h="100%" border="1px dashed" borderColor={borderSoft} rounded="xl">
                  <HStack spacing={3}>
                    <Spinner size="sm" />
                    <Text fontSize="sm" color={textMuted}>
                      Đang tải doanh thu theo năm...
                    </Text>
                  </HStack>
                </Center>
              ) : revenueByMonth.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByMonth} margin={{ top: 10, right: 16, bottom: 0, left: 36 }}>
                    <CartesianGrid strokeDasharray="4 4" />
                    <XAxis dataKey="month" tickFormatter={toMonthLabel} tickMargin={8} />
                    <YAxis
                      tickFormatter={(v) => fmtMoney(v)}
                      width={95}
                      tickMargin={10}
                      domain={[0, (max) => Math.ceil(max * 1.15)]}
                    />
                    <ReTooltip content={yearTooltip} />
                    <Bar dataKey="revenue" fill="#0F766E" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Center h="100%" border="1px dashed" borderColor={borderSoft} rounded="xl">
                  <Text fontSize="sm" color={textMuted}>
                    Chưa có dữ liệu doanh thu theo năm
                  </Text>
                </Center>
              )}
            </Box>

            <Divider my={4} />

            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <Text fontSize="sm" color={textMuted}>
                Tổng doanh thu năm: <b>{fmtVND(yearTotalRevenue)}</b>
              </Text>

              {yearErr ? (
                <Badge colorScheme="red" rounded="md" px={3} py={1}>
                  {yearErr}
                </Badge>
              ) : null}
            </HStack>
          </>
        )}
      </PanelCard>

      <Divider my={6} />

      {/* CHARTS */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
        {/* Revenue by day */}
        <PanelCard
          title="Doanh thu theo ngày"
          subtitle={`Tháng ${month}`}
          right={
            <Badge colorScheme="green" variant="subtle" rounded="full">
              REVENUE
            </Badge>
          }
        >
          <Box h="300px" minW={0}>
            {revenueByDay.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueByDay} margin={{ top: 10, right: 16, bottom: 0, left: 36 }}>
                  <CartesianGrid strokeDasharray="4 4" />
                  <XAxis dataKey="day" tickFormatter={toDayLabel} tickMargin={8} />
                  <YAxis
                    tickFormatter={(v) => fmtMoney(v)}
                    width={95}
                    tickMargin={10}
                    domain={[0, (max) => Math.ceil(max * 1.15)]}
                  />
                  <ReTooltip content={chartTooltip} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0F766E"
                    strokeWidth={2}
                    dot={singlePoint ? { r: 7 } : { r: 4 }}
                    activeDot={singlePoint ? { r: 9 } : { r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Center h="100%" border="1px dashed" borderColor={borderSoft} rounded="xl">
                <Text fontSize="sm" color={textMuted}>
                  Chưa có dữ liệu doanh thu tháng này
                </Text>
              </Center>
            )}
          </Box>

          <Divider my={4} />
          <HStack justify="space-between" flexWrap="wrap" gap={2}>
            <Text fontSize="sm" color={textMuted}>
              Orders valid: <b>{kpi.ordersValid ?? 0}</b>
            </Text>
            <Text fontSize="sm" color={textMuted}>
              Tổng doanh thu: <b>{fmtVND(kpi.revenue || 0)}</b>
            </Text>
          </HStack>
        </PanelCard>

        {/* Orders by status */}
        <PanelCard
          title="Đơn theo trạng thái"
          subtitle={`Total: ${kpi.ordersTotal || 0}`}
          right={
            <Badge colorScheme="teal" variant="subtle" rounded="full">
              STATUS
            </Badge>
          }
        >
          <VStack spacing={3} align="stretch">
            {ordersByStatus.length ? (
              ordersByStatus.map((s) => {
                const total = Number(kpi.ordersTotal || 0);
                const percent = total ? Math.round((s.count / total) * 100) : 0;
                const meta = statusMeta(s.status);
                const fillBg = `${meta.scheme}.${statusShade}`;

                return (
                  <Box key={s.status} border="1px solid" borderColor={borderSoft} rounded="xl" p={3}>
                    <HStack justify="space-between" mb={2}>
                      <HStack spacing={2}>
                        <Badge colorScheme={meta.scheme} variant="subtle" rounded="full">
                          {meta.label}
                        </Badge>
                        <Text fontSize="sm" color={textMuted}>
                          {s.status}
                        </Text>
                      </HStack>
                      <Text fontSize="sm" color={textMuted}>
                        <b>{s.count}</b> ({percent}%)
                      </Text>
                    </HStack>

                    <Box h="8px" rounded="full" bg={barTrackBg} overflow="hidden">
                      <Box h="100%" width={`${percent}%`} bg={fillBg} transition="width 0.2s ease" />
                    </Box>
                  </Box>
                );
              })
            ) : (
              <Center h="300px" border="1px dashed" borderColor={borderSoft} rounded="xl">
                <Text fontSize="sm" color={textMuted}>
                  Chưa có dữ liệu trạng thái
                </Text>
              </Center>
            )}
          </VStack>
        </PanelCard>
      </SimpleGrid>

      {/* ADMIN COMPARE TABLE */}
      {isAdmin && compare ? (
        <PanelCard
          title="So sánh theo Staff"
          subtitle="Chỉ admin mới xem được"
          right={
            <Badge colorScheme="purple" variant="subtle" rounded="full">
              {compareRows.length} staff
            </Badge>
          }
        >
          {compareRows.length ? (
            <TableContainer border="1px solid" borderColor={borderSoft} rounded="xl">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th w="60px">#</Th>
                    <Th>StaffId</Th>
                    <Th isNumeric>Revenue</Th>
                    <Th isNumeric>Success</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {compareRows.map((x, idx) => (
                    <Tr key={x._id}>
                      <Td fontWeight="bold">{idx + 1}</Td>
                      <Td fontFamily="mono" fontSize="xs">
                        {x._id}
                      </Td>
                      <Td isNumeric fontWeight="semibold">
                        {fmtVND(x.revenue || 0)}
                      </Td>
                      <Td isNumeric>{x.ordersSuccess || 0}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <Center h="180px" border="1px dashed" borderColor={borderSoft} rounded="xl">
              <Text fontSize="sm" color={textMuted}>
                Không có dữ liệu compare (hãy đảm bảo order có staff)
              </Text>
            </Center>
          )}
        </PanelCard>
      ) : null}
    </Box>
  );
}
