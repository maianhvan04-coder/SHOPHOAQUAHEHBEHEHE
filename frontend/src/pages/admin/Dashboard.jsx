// src/pages/admin/Dashboard.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Center,
  Checkbox,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Input,
  SimpleGrid,
  Skeleton,
  Spinner,
  Stack,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
  useToken,
} from "@chakra-ui/react";

import {
  ArrowPathIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from "recharts";

import PageHeader from "~/components/layout/admin/PageHeader";
import { getDashboardDayAPI, getDashboardMonthAPI, getDashboardYearAPI } from "~/api/dashboardApi";

/* =======================================================================================
  Utils
======================================================================================= */
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

function currentMonthStr() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${m}`;
}
function prevMonthStr(yyyyMM) {
  const [y, m] = String(yyyyMM || "").split("-").map(Number);
  const d = new Date(Date.UTC(y, (m || 1) - 1, 1));
  d.setUTCMonth(d.getUTCMonth() - 1);
  const yy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
}

function safePctChange(cur, prev) {
  const c = Number(cur || 0);
  const p = Number(prev || 0);
  if (p <= 0) return null;
  return Math.round(((c - p) / p) * 100);
}

function fmtNumber(n) {
  return Number(n || 0).toLocaleString("vi-VN");
}
function fmtMoney(n) {
  return fmtNumber(Math.round(Number(n || 0)));
}
function fmtPercent(n, digits = 1) {
  return Number(n || 0).toFixed(digits);
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

function vnYYYYMMDD(date = new Date()) {
  const d = new Date(date.getTime() + VN_OFFSET_MS);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function vnYesterdayStr() {
  const now = new Date();
  return vnYYYYMMDD(new Date(now.getTime() - 24 * 60 * 60 * 1000));
}
function prevDayStr(yyyyMMdd) {
  if (!yyyyMMdd) return vnYesterdayStr();
  const [y, m, d] = String(yyyyMMdd).split("-").map(Number);
  const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  dt.setUTCDate(dt.getUTCDate() - 1);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}
function fmtDayVN(yyyyMMdd) {
  if (!yyyyMMdd) return "";
  const [y, m, d] = String(yyyyMMdd).split("-");
  if (!y || !m || !d) return yyyyMMdd;
  return `${d}/${m}/${y}`;
}

function normalizeRole(r) {
  if (!r) return "";
  if (typeof r === "string") return r.toUpperCase();
  if (typeof r === "object" && r.code) return String(r.code).toUpperCase();
  return String(r).toUpperCase();
}

function pickLabelFromChartClick(e) {
  return e?.activeLabel || e?.activePayload?.[0]?.payload?.day || e?.activePayload?.[0]?.payload?.month || "";
}

function prettyStatus(s) {
  const x = String(s || "").toLowerCase();
  if (x.includes("pend")) return "Pending";
  if (x.includes("confirm") || x.includes("process")) return "Confirmed";
  if (x.includes("ship")) return "Shipped";
  if (x.includes("deliver")) return "Delivered";
  if (x.includes("paid")) return "Paid";
  if (x.includes("cancel")) return "Cancelled";
  if (x.includes("return")) return "Returned";
  return String(s || "Unknown");
}

/* =======================================================================================
  UI blocks
======================================================================================= */

function Pill({ children, scheme = "gray" }) {
  return (
    <Badge colorScheme={scheme} variant="subtle" rounded="full" px={3} py={1} fontWeight="900">
      {children}
    </Badge>
  );
}

function EmptyState({ text }) {
  const muted = useColorModeValue("gray.600", "gray.400");
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  const bg = useColorModeValue("gray.50", "whiteAlpha.50");
  return (
    <Center h="260px" border="1px dashed" borderColor={border} rounded="xl" bg={bg}>
      <Text fontSize="sm" color={muted} fontWeight="700">
        {text}
      </Text>
    </Center>
  );
}

function SectionCard({ title, subtitle, right, isLoading, children, hint }) {
  const bg = useColorModeValue("white", "gray.900");
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  const muted = useColorModeValue("gray.600", "gray.400");

  return (
    <Card bg={bg} border="1px solid" borderColor={border} rounded="2xl" shadow="sm">
      <CardBody p={{ base: 4, md: 6 }}>
        <HStack justify="space-between" align="start" mb={3} gap={3} flexWrap="wrap">
          <Box minW={0}>
            <Text fontSize="lg" fontWeight="900" noOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text fontSize="sm" color={muted} mt={1} noOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </Box>
          {right}
        </HStack>

        {hint ? (
          <Text fontSize="sm" color={muted} mb={4}>
            {hint}
          </Text>
        ) : null}

        {isLoading ? (
          <Stack spacing={3}>
            <Skeleton height="12px" />
            <Skeleton height="12px" />
            <Skeleton height="280px" rounded="xl" />
          </Stack>
        ) : (
          children
        )}
      </CardBody>
    </Card>
  );
}

function KpiCard({ title, value, icon, format = "number", trend, sub }) {
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  const muted = useColorModeValue("gray.600", "gray.400");
  const bg = useColorModeValue("white", "gray.900");
  const iconBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const text = format === "money" ? fmtMoney(value) : format === "percent" ? fmtPercent(value, 1) : fmtNumber(value);
  const suffix = format === "money" ? "₫" : format === "percent" ? "%" : "";

  const trendColor =
    trend === null || trend === undefined ? muted : trend > 0 ? "green.500" : trend < 0 ? "red.500" : muted;

  return (
    <Card bg={bg} border="1px solid" borderColor={border} rounded="2xl" shadow="sm">
      <CardBody p={{ base: 4, md: 5 }}>
        <HStack justify="space-between" align="start" spacing={3}>
          <Box minW={0}>
            <Text fontSize="sm" color={muted} fontWeight="800" noOfLines={1}>
              {title}
            </Text>

            <HStack mt={2} spacing={2} align="baseline" minW={0}>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="900" lineHeight="1" noOfLines={1}>
                {text}
              </Text>
              <Text fontSize="sm" color={muted} fontWeight="800" flexShrink={0}>
                {suffix}
              </Text>
            </HStack>

            <HStack mt={2} spacing={2} flexWrap="wrap">
              {trend === null || trend === undefined ? (
                <Text fontSize="xs" color={muted} fontWeight="700">
                  —
                </Text>
              ) : (
                <Text fontSize="xs" color={trendColor} fontWeight="900">
                  {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
                </Text>
              )}
              {sub ? (
                <Text fontSize="xs" color={muted} fontWeight="700" noOfLines={1}>
                  {sub}
                </Text>
              ) : null}
            </HStack>
          </Box>

          <Box w="44px" h="44px" rounded="full" bg={iconBg} display="grid" placeItems="center" flexShrink={0}>
            <Icon as={icon} w="22px" h="22px" color={useColorModeValue("gray.700", "gray.200")} />
          </Box>
        </HStack>
      </CardBody>
    </Card>
  );
}

function SparkCard({ title, value, suffix, data, dataKey = "value", color, note }) {
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  const muted = useColorModeValue("gray.600", "gray.400");
  const bg = useColorModeValue("white", "gray.900");

  return (
    <Card bg={bg} border="1px solid" borderColor={border} rounded="2xl" shadow="sm">
      <CardBody p={{ base: 4, md: 5 }}>
        <HStack justify="space-between" align="start" gap={3}>
          <Box minW={0}>
            <Text fontSize="sm" color={muted} fontWeight="800" noOfLines={1}>
              {title}
            </Text>
            <HStack spacing={2} align="baseline" mt={2}>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="900" lineHeight="1" noOfLines={1}>
                {value}
              </Text>
              <Text fontSize="sm" color={muted} fontWeight="800">
                {suffix}
              </Text>
            </HStack>
            {note ? (
              <Text fontSize="xs" color={muted} mt={2} noOfLines={1}>
                {note}
              </Text>
            ) : null}
          </Box>

          <Box w="140px" h="46px" flexShrink={0}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data || []} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
                <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </HStack>
      </CardBody>
    </Card>
  );
}

function StatusDistribution({ rows, rowsPrev }) {
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  const muted = useColorModeValue("gray.600", "gray.400");
  const cardBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const trackBg = useColorModeValue("gray.200", "whiteAlpha.200");
  const panelBg = useColorModeValue("white", "gray.900");

  // hex colors for charts
  const [yellow, blue, purple, green, red, orange, gray] = useToken("colors", [
    "yellow.400",
    "blue.400",
    "purple.400",
    "green.400",
    "red.400",
    "orange.400",
    "gray.400",
  ]);

  const metaByStatus = useCallback(
    (s) => {
      const x = String(s || "").toLowerCase();
      if (x.includes("pending") || x.includes("pend")) return { label: "Pending", color: yellow };
      if (x.includes("confirm") || x.includes("process")) return { label: "Confirmed", color: blue };
      if (x.includes("ship")) return { label: "Shipped", color: purple };
      if (x.includes("deliver")) return { label: "Delivered", color: green };
      if (x.includes("paid")) return { label: "Paid", color: green };
      if (x.includes("cancel")) return { label: "Cancelled", color: red };
      if (x.includes("return") || x.includes("refund")) return { label: "Returned", color: orange };
      return { label: prettyStatus(s), color: gray };
    },
    [yellow, blue, purple, green, red, orange, gray]
  );

  const { data, total, topLabel } = useMemo(() => {
    const cur = (rows || [])
      .map((x) => {
        const count = Number(x.count || 0);
        const m = metaByStatus(x.status);
        return { key: String(x.status || m.label), status: x.status, label: m.label, count, color: m.color };
      })
      .filter((x) => x.count > 0);

    const prev = (rowsPrev || [])
      .map((x) => {
        const count = Number(x.count || 0);
        const m = metaByStatus(x.status);
        return { key: String(x.status || m.label), count, label: m.label };
      })
      .filter((x) => x.count > 0);

    const prevMap = new Map(prev.map((p) => [p.label, p.count]));

    // merge by label (practical for dashboards)
    const merged = new Map();
    for (const c of cur) {
      const prevCount = prevMap.get(c.label) || 0;
      merged.set(c.label, {
        ...c,
        prevCount,
        delta: c.count - prevCount,
      });
    }
    // include statuses that existed yesterday but not today
    for (const p of prev) {
      if (!merged.has(p.label)) {
        const m = metaByStatus(p.label);
        merged.set(p.label, {
          key: p.label,
          status: p.label,
          label: p.label,
          count: 0,
          prevCount: p.count,
          delta: 0 - p.count,
          color: m.color,
        });
      }
    }

    const list = Array.from(merged.values()).sort((a, b) => b.count - a.count);
    const t = list.reduce((s, r) => s + r.count, 0);

    const final = list.map((r) => ({
      ...r,
      pct: t ? (r.count / t) * 100 : 0,
      prevPct: r.prevCount ? (r.prevCount / (prev.reduce((s, x) => s + x.count, 0) || 1)) * 100 : 0,
    }));

    return {
      data: final,
      total: t,
      topLabel: final?.[0]?.label || "—",
    };
  }, [rows, rowsPrev, metaByStatus]);

  if (!data.length) return <EmptyState text="Chưa có dữ liệu trạng thái theo ngày" />;

  const top = data[0] || {};
  const totalPrev = (rowsPrev || []).reduce((s, x) => s + Number(x.count || 0), 0);
  const totalDelta = total - totalPrev;
  const totalDeltaColor = totalDelta > 0 ? "green.500" : totalDelta < 0 ? "red.500" : muted;

  return (
    <Box>
      {/* summary */}
      <Box p={4} rounded="xl" border="1px solid" borderColor={border} bg={cardBg} mb={4}>
        <HStack justify="space-between" align="start" gap={3} flexWrap="wrap">
          <Box minW={0}>
            <Text fontSize="sm" color={muted} fontWeight="800">
              Tổng đơn (hôm nay)
            </Text>
            <HStack align="baseline" spacing={3} mt={1} flexWrap="wrap">
              <Text fontSize="2xl" fontWeight="900" lineHeight="1">
                {fmtNumber(total)}
              </Text>
              <Text fontSize="sm" fontWeight="900" color={totalDeltaColor}>
                {totalDelta >= 0 ? "▲" : "▼"} {fmtNumber(Math.abs(totalDelta))} vs hôm qua
              </Text>
            </HStack>

            <Text fontSize="sm" color={muted} mt={2} noOfLines={1}>
              Trạng thái nhiều nhất: <b>{topLabel}</b> ({fmtNumber(top.count)} • {fmtPercent(top.pct, 1)}%)
            </Text>
          </Box>

          <Pill scheme="blue">STATUS</Pill>
        </HStack>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* donut */}
        <Box border="1px solid" borderColor={border} rounded="xl" p={4} bg={panelBg}>
          <HStack justify="space-between" mb={3}>
            <Text fontSize="sm" color={muted} fontWeight="900">
              Tỉ trọng trạng thái
            </Text>
            <Pill scheme="gray">Donut</Pill>
          </HStack>

          <Box position="relative" h="260px">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="count" nameKey="label" innerRadius={70} outerRadius={105} paddingAngle={2} stroke="transparent">
                  {data.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <Center position="absolute" inset={0} pointerEvents="none">
              <VStack spacing={0}>
                <Text fontSize="xs" color={muted} fontWeight="800">
                  Total
                </Text>
                <Text fontSize="2xl" fontWeight="900" lineHeight="1">
                  {fmtNumber(total)}
                </Text>
              </VStack>
            </Center>
          </Box>

          <Divider my={3} />

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
            {data.slice(0, 6).map((x) => (
              <HStack key={x.label} justify="space-between" gap={3} minW={0}>
                <HStack minW={0}>
                  <Box w="10px" h="10px" rounded="full" bg={x.color} />
                  <Text fontSize="sm" fontWeight="800" noOfLines={1}>
                    {x.label}
                  </Text>
                </HStack>
                <Text fontSize="sm" fontWeight="900" whiteSpace="nowrap">
                  {fmtPercent(x.pct, 1)}%
                </Text>
              </HStack>
            ))}
          </SimpleGrid>
        </Box>

        {/* list with delta + progress */}
        <Box border="1px solid" borderColor={border} rounded="xl" p={4} bg={panelBg}>
          <HStack justify="space-between" mb={3}>
            <Text fontSize="sm" color={muted} fontWeight="900">
              Chi tiết theo trạng thái (vs hôm qua)
            </Text>
            <Pill scheme="gray">Breakdown</Pill>
          </HStack>

          <Stack spacing={3}>
            {data.map((x) => {
              const dc = x.delta > 0 ? "green.500" : x.delta < 0 ? "red.500" : muted;
              return (
                <Box key={x.label} p={3} rounded="lg" border="1px solid" borderColor={border} bg={cardBg}>
                  <HStack justify="space-between" gap={3} align="start">
                    <HStack minW={0} spacing={3}>
                      <Box w="10px" h="10px" rounded="full" bg={x.color} mt="6px" />
                      <Box minW={0}>
                        <Text fontWeight="900" noOfLines={1}>
                          {x.label}
                        </Text>
                        <HStack spacing={2} flexWrap="wrap">
                          <Text fontSize="xs" color={muted} fontWeight="700">
                            {fmtNumber(x.count)} đơn • {fmtPercent(x.pct, 1)}%
                          </Text>
                          <Text fontSize="xs" fontWeight="900" color={dc}>
                            {x.delta >= 0 ? "▲" : "▼"} {fmtNumber(Math.abs(x.delta))} vs hôm qua
                          </Text>
                        </HStack>
                      </Box>
                    </HStack>

                    <Badge rounded="full" px={3} py={1} fontWeight="900" whiteSpace="nowrap">
                      {fmtNumber(x.count)}
                    </Badge>
                  </HStack>

                  <Box mt={3} h="10px" rounded="full" bg={trackBg} overflow="hidden">
                    <Box h="100%" w={`${Math.max(0.5, x.pct)}%`} bg={x.color} />
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}

/* =======================================================================================
  Page
======================================================================================= */

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const rolesRaw = JSON.parse(localStorage.getItem("roles") || "[]");
  const roles = rolesRaw.map(normalizeRole);
  const isAdmin = roles.includes("ADMIN") || roles.includes("ROLE_ADMIN");

  // theme
  const pageBg = useColorModeValue("gray.50", "gray.950");
  const textMuted = useColorModeValue("gray.600", "gray.300");
  const borderSoft = useColorModeValue("gray.200", "whiteAlpha.200");
  const tooltipBg = useColorModeValue("white", "gray.900");

  // chart colors
  const [teal500, teal300, purple500, purple300, gridLight, gridDark, blue500, blue300] = useToken("colors", [
    "teal.500",
    "teal.300",
    "purple.500",
    "purple.300",
    "gray.200",
    "whiteAlpha.200",
    "blue.500",
    "blue.300",
  ]);
  const chartTeal = useColorModeValue(teal500, teal300);
  const chartPurple = useColorModeValue(purple500, purple300);
  const chartBlue = useColorModeValue(blue500, blue300);
  const gridStroke = useColorModeValue(gridLight, gridDark);

  // top-level tabs
  const [mainTab, setMainTab] = useState(0); // 0 overview, 1 details
  const dayRef = useRef(null);

  // filters
  const [month, setMonth] = useState(currentMonthStr());
  const [staffId, setStaffId] = useState("");
  const [compare, setCompare] = useState(false);

  // compare picker
  const [compareSearch, setCompareSearch] = useState("");
  const [selectedStaffIds, setSelectedStaffIds] = useState([]); // [] = all

  // day
  const [selectedDate, setSelectedDate] = useState("");

  // loading/data
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [curData, setCurData] = useState(null);
  const [prevData, setPrevData] = useState(null);
  const [yearData, setYearData] = useState(null);

  const [dayLoading, setDayLoading] = useState(false);
  const [dayErr, setDayErr] = useState("");
  const [dayData, setDayData] = useState(null);
  const [dayPrevData, setDayPrevData] = useState(null); // yesterday (for delta)

  const [lastUpdated, setLastUpdated] = useState(null);

  // avoid staffId + compare
  useEffect(() => {
    if (compare && staffId) setStaffId("");
  }, [compare, staffId]);

  const scrollToDay = () => {
    const el = dayRef.current;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const loadDay = useCallback(
    async (overrideDate) => {
      setDayLoading(true);
      setDayErr("");

      try {
        const dateReq = overrideDate !== undefined ? overrideDate : selectedDate;
        const paramsBase = {
          ...(dateReq ? { date: dateReq } : {}),
          ...(isAdmin && !compare && staffId ? { staffId } : {}),
        };

        // also fetch yesterday for delta
        const y = dateReq ? prevDayStr(dateReq) : vnYesterdayStr();
        const paramsPrev = {
          ...(y ? { date: y } : {}),
          ...(isAdmin && !compare && staffId ? { staffId } : {}),
        };

        const [resToday, resY] = await Promise.all([getDashboardDayAPI(paramsBase), getDashboardDayAPI(paramsPrev)]);

        const payloadToday = resToday?.data?.data ?? resToday?.data ?? null;
        const payloadY = resY?.data?.data ?? resY?.data ?? null;

        setDayData(payloadToday);
        setDayPrevData(payloadY);

        if (!selectedDate && payloadToday?.day) setSelectedDate(payloadToday.day);
      } catch (e) {
        const msg = e?.response?.data?.message || e.message || "Lỗi tải dashboard theo ngày";
        setDayErr(msg);
      } finally {
        setDayLoading(false);
      }
    },
    [selectedDate, isAdmin, compare, staffId]
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    setErr("");

    try {
      const prevMonth = prevMonthStr(month);
      const y = String(month || "").slice(0, 4);

      const paramsCur = {
        month,
        ...(isAdmin && !compare && staffId ? { staffId } : {}),
        ...(isAdmin && compare ? { compare: "1" } : {}),
      };
      const paramsPrev = {
        month: prevMonth,
        ...(isAdmin && !compare && staffId ? { staffId } : {}),
      };
      const paramsYear = {
        year: y,
        ...(isAdmin && !compare && staffId ? { staffId } : {}),
      };

      const [curRes, prevRes, yearRes] = await Promise.all([
        getDashboardMonthAPI(paramsCur),
        getDashboardMonthAPI(paramsPrev),
        compare ? Promise.resolve(null) : getDashboardYearAPI(paramsYear),
      ]);

      setCurData(curRes?.data?.data ?? curRes?.data ?? null);
      setPrevData(prevRes?.data?.data ?? prevRes?.data ?? null);
      setYearData(yearRes ? (yearRes?.data?.data ?? yearRes?.data ?? null) : null);

      await loadDay(undefined);

      setLastUpdated(new Date());
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Lỗi tải dashboard";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }, [month, staffId, compare, isAdmin, loadDay]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  /* =======================================================================================
    Derived
  ===================================================================================== */
  const kpi = curData?.kpi || {};
  const kpiPrev = prevData?.kpi || {};

  const revenueTrend = safePctChange(kpi.revenue, kpiPrev.revenue);
  const totalTrend = safePctChange(kpi.ordersTotal, kpiPrev.ordersTotal);
  const successTrend = safePctChange(kpi.ordersSuccess, kpiPrev.ordersSuccess);
  const aovTrend = safePctChange(kpi.aov, kpiPrev.aov);
  const customerTrend = safePctChange(kpi.uniqueCustomers, kpiPrev.uniqueCustomers);
  const cancelledTrend = safePctChange(kpi.ordersCancelled, kpiPrev.ordersCancelled);

  const convRate = useMemo(() => {
    const t = Number(kpi.ordersTotal || 0);
    const s = Number(kpi.ordersSuccess || 0);
    if (t <= 0) return 0;
    return (s / t) * 100;
  }, [kpi.ordersTotal, kpi.ordersSuccess]);

  const convRatePrev = useMemo(() => {
    const t = Number(kpiPrev.ordersTotal || 0);
    const s = Number(kpiPrev.ordersSuccess || 0);
    if (t <= 0) return 0;
    return (s / t) * 100;
  }, [kpiPrev.ordersTotal, kpiPrev.ordersSuccess]);

  const convTrend = safePctChange(convRate, convRatePrev);

  const revenueByDay = useMemo(() => {
    const raw = curData?.revenueByDay || [];
    return raw
      .map((x) => ({
        ...x,
        revenue: Number(x.revenue || 0),
        ordersSuccess: Number(x.ordersSuccess || 0),
        ordersTotal: Number(x.ordersTotal || 0),
      }))
      .sort((a, b) => String(a.day).localeCompare(String(b.day)));
  }, [curData]);

  const yearStr = String(month || "").slice(0, 4);
  const revenueByMonth = useMemo(() => (yearData?.revenueByMonth || []).slice().sort((a, b) => String(a.month).localeCompare(String(b.month))), [yearData]);

  // compare
  const compareByStaff = useMemo(() => curData?.compareByStaff || [], [curData]);
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

  const compareTop = useMemo(() => {
    const rows = [...compareRows].sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0));
    return rows.slice(0, 12).map((x) => ({
      staffId: String(x._id),
      revenue: Number(x.revenue || 0),
      ordersSuccess: Number(x.ordersSuccess || 0),
    }));
  }, [compareRows]);

  // day
  const dayKpi = dayData?.kpi || {};
  const dayLabel = dayData?.day || selectedDate || "";
  const dayOrdersByStatus = dayData?.ordersByStatus || [];
  const dayOrdersByStatusPrev = dayPrevData?.ordersByStatus || [];

  // last 7 days (for mini trends) – use monthly series
  const last7 = useMemo(() => {
    if (!revenueByDay.length) return [];
    const anchor = dayLabel || vnYYYYMMDD(new Date());

    const filtered = revenueByDay.filter((x) => String(x.day || "") <= String(anchor));
    const base = (filtered.length ? filtered : revenueByDay).slice(-7);

    return base.map((x) => ({
      day: x.day,
      revenue: Number(x.revenue || 0),
      success: Number(x.ordersSuccess || 0),
      total: Number(x.ordersTotal || 0),
    }));
  }, [revenueByDay, dayLabel]);

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) return "";
    const hh = String(lastUpdated.getHours()).padStart(2, "0");
    const mm = String(lastUpdated.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }, [lastUpdated]);

  /* =======================================================================================
    Actions
  ===================================================================================== */
  const onChartClick = useCallback(
    (e) => {
      const day = pickLabelFromChartClick(e);
      if (!day) return;
      setSelectedDate(day);
      loadDay(day);
      setMainTab(1); // switch to details
      requestAnimationFrame(scrollToDay);
    },
    [loadDay]
  );

  const onPickYesterday = () => {
    const y = dayLabel ? prevDayStr(dayLabel) : vnYesterdayStr();
    setSelectedDate(y);
    loadDay(y);
    setMainTab(1);
    requestAnimationFrame(scrollToDay);
  };

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

  /* =======================================================================================
    Tooltip
  ===================================================================================== */
  const chartTooltip = useCallback(
    ({ active, payload, label }) => {
      if (!active || !payload?.length) return null;

      const item = payload[0]?.payload || {};
      const day = item.day || label;

      return (
        <Box bg={tooltipBg} border="1px solid" borderColor={borderSoft} rounded="lg" px={3} py={2} shadow="md">
          <Text fontSize="xs" color={textMuted}>
            {item.day ? `Ngày ${day}` : `Tháng ${label}`}
          </Text>
          {"revenue" in item ? (
            <Text fontSize="sm" fontWeight="900">
              Doanh thu: {fmtMoney(item.revenue || 0)} ₫
            </Text>
          ) : (
            <Text fontSize="sm" fontWeight="900">
              Giá trị: {fmtMoney(payload[0]?.value ?? 0)} ₫
            </Text>
          )}
          {"ordersSuccess" in item ? (
            <Text fontSize="xs" color={textMuted} mt={1}>
              Thành công: {fmtNumber(item.ordersSuccess || 0)}
            </Text>
          ) : null}
          {item.day ? (
            <Text fontSize="xs" color={textMuted} mt={1}>
              Click để xem chi tiết ngày
            </Text>
          ) : null}
        </Box>
      );
    },
    [tooltipBg, borderSoft, textMuted]
  );

  /* =======================================================================================
    Render
  ===================================================================================== */
  return (
    <Box bg={pageBg} minH="100vh">
      <Box p={{ base: 4, md: 8 }}>
        <PageHeader title="Dashboard đơn hàng" description={`Chào ${user?.name || user?.fullName || "bạn"} 👋`} />

        {/* FILTER BAR */}
        <Card
          bg={useColorModeValue("white", "gray.900")}
          border="1px solid"
          borderColor={borderSoft}
          rounded="2xl"
          shadow="sm"
          mb={6}
          position="sticky"
          top="12px"
          zIndex={10}
          backdropFilter="blur(6px)"
        >
          <CardBody p={{ base: 4, md: 5 }}>
            <Stack direction={{ base: "column", lg: "row" }} spacing={4} justify="space-between" align={{ lg: "center" }}>
              <HStack spacing={4} flexWrap="wrap" align="end">
                <Box>
                  <Text fontSize="sm" color={textMuted} mb={1} fontWeight="800">
                    Tháng
                  </Text>
                  <HStack>
                    <Icon as={CalendarDaysIcon} w={4} h={4} color={textMuted} />
                    <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} maxW="220px" />
                  </HStack>
                </Box>

                {isAdmin ? (
                  <Box opacity={compare ? 0.5 : 1} pointerEvents={compare ? "none" : "auto"}>
                    <Text fontSize="sm" color={textMuted} mb={1} fontWeight="800">
                      StaffId (tuỳ chọn)
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
                    <FormLabel mb="0" fontSize="sm" color={textMuted} fontWeight="800">
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

              <HStack spacing={3} flexWrap="wrap" justify={{ base: "flex-start", lg: "flex-end" }}>
                <Pill scheme={isAdmin ? "purple" : "green"}>{isAdmin ? "ADMIN" : "STAFF"}</Pill>
                {lastUpdatedLabel ? <Pill>Updated {lastUpdatedLabel}</Pill> : null}

                <Tooltip label="Refresh" hasArrow>
                  <IconButton
                    aria-label="Refresh"
                    icon={<Icon as={ArrowPathIcon} w={5} h={5} />}
                    variant="outline"
                    onClick={loadAll}
                    isLoading={loading}
                  />
                </Tooltip>

                <Button onClick={loadAll} size="sm" variant="solid" isLoading={loading} fontWeight="900">
                  Refresh
                </Button>
              </HStack>
            </Stack>

            {/* compare picker */}
            {isAdmin && compare ? (
              <Box mt={5}>
                <Divider mb={4} />
                <HStack justify="space-between" mb={2} flexWrap="wrap" gap={2}>
                  <Text fontSize="sm" color={textMuted} fontWeight="700">
                    Chọn staff để xem (không chọn = tất cả)
                  </Text>
                  <HStack spacing={2}>
                    <Button size="xs" variant="outline" onClick={selectAllVisible} fontWeight="900">
                      Select visible
                    </Button>
                    <Button size="xs" variant="outline" onClick={clearAll} fontWeight="900">
                      Clear
                    </Button>
                  </HStack>
                </HStack>

                <HStack spacing={3} align="start" flexWrap="wrap">
                  <Box flex="1" minW={{ base: "100%", md: "340px" }}>
                    <Input placeholder="Search staffId..." value={compareSearch} onChange={(e) => setCompareSearch(e.target.value)} />
                  </Box>

                  <Box
                    flex="2"
                    minW={{ base: "100%", md: "520px" }}
                    border="1px solid"
                    borderColor={borderSoft}
                    rounded="xl"
                    p={3}
                    maxH="220px"
                    overflow="auto"
                    bg={useColorModeValue("gray.50", "whiteAlpha.50")}
                  >
                    {compareOptions.length ? (
                      <Stack spacing={2}>
                        {compareOptions.map((x) => {
                          const id = String(x._id);
                          return (
                            <HStack key={id} justify="space-between">
                              <Checkbox isChecked={selectedStaffIds.includes(id)} onChange={(e) => toggleStaff(id, e.target.checked)}>
                                <Text fontFamily="mono" fontSize="xs" fontWeight="800" noOfLines={1}>
                                  {id}
                                </Text>
                              </Checkbox>
                              <Text fontSize="xs" color={textMuted} whiteSpace="nowrap" fontWeight="900">
                                {fmtMoney(x.revenue || 0)} ₫
                              </Text>
                            </HStack>
                          );
                        })}
                      </Stack>
                    ) : (
                      <Text fontSize="sm" color={textMuted} fontWeight="700">
                        Không tìm thấy staff phù hợp
                      </Text>
                    )}
                  </Box>
                </HStack>
              </Box>
            ) : null}

            {err ? (
              <Box mt={4}>
                <Badge colorScheme="red" rounded="md" px={3} py={1} fontWeight="900">
                  {err}
                </Badge>
              </Box>
            ) : (
              <Text mt={3} fontSize="sm" color={textMuted} fontWeight="600">
                Rule doanh thu: COD = Delivered, non-COD = Paid
              </Text>
            )}
          </CardBody>
        </Card>

        {/* MAIN TABS */}
        <Tabs index={mainTab} onChange={setMainTab} variant="soft-rounded" colorScheme="blue" mb={6}>
          <TabList gap={2} flexWrap="wrap">
            <Tab fontWeight="900">Tổng quan</Tab>
            <Tab fontWeight="900">Chi tiết</Tab>
          </TabList>

          <TabPanels>
            {/* ======================
              OVERVIEW
            ====================== */}
            <TabPanel px={0}>
              <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={5} mb={6}>
                <KpiCard title="Doanh thu" value={kpi.revenue || 0} icon={CurrencyDollarIcon} format="money" trend={revenueTrend} sub="vs last month" />
                <KpiCard title="Khách unique" value={kpi.uniqueCustomers || 0} icon={UsersIcon} trend={customerTrend} sub="vs last month" />
                <KpiCard title="Tổng đơn" value={kpi.ordersTotal || 0} icon={ShoppingCartIcon} trend={totalTrend} sub="vs last month" />
                <KpiCard title="Conversion" value={convRate} icon={ArrowTrendingUpIcon} format="percent" trend={convTrend} sub="vs last month" />
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
                <SectionCard
                  title="Doanh thu theo ngày"
                  subtitle={`Tháng ${month} • Click để xem chi tiết ngày`}
                  right={<Pill scheme="green">REVENUE</Pill>}
                  isLoading={loading && !curData}

                >
                  {revenueByDay.length ? (
                    <Box h="320px" minW={0}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueByDay} onClick={onChartClick} margin={{ top: 10, right: 16, bottom: 0, left: 36 }}>
                          <defs>
                            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={chartTeal} stopOpacity={0.25} />
                              <stop offset="100%" stopColor={chartTeal} stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke={gridStroke} strokeDasharray="4 4" />
                          <XAxis dataKey="day" tickFormatter={toDayLabel} tickMargin={8} />
                          <YAxis tickFormatter={(v) => fmtNumber(v)} width={95} tickMargin={10} domain={[0, (max) => Math.ceil(max * 1.15)]} />
                          <ReTooltip content={chartTooltip} />
                          {dayLabel ? <ReferenceLine x={dayLabel} stroke={chartPurple} strokeDasharray="3 3" /> : null}
                          <Area type="monotone" dataKey="revenue" stroke={chartTeal} strokeWidth={2.5} fill="url(#revFill)" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <EmptyState text="Chưa có dữ liệu doanh thu tháng này" />
                  )}
                </SectionCard>

                <SectionCard
                  title="Đơn thành công theo ngày"
                  subtitle={`Tháng ${month} • Click cột để xem chi tiết ngày`}
                  right={<Pill scheme="purple">SUCCESS</Pill>}
                  isLoading={loading && !curData}
                >
                  {revenueByDay.length ? (
                    <Box h="320px" minW={0}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueByDay} onClick={onChartClick} margin={{ top: 10, right: 16, bottom: 0, left: 16 }}>
                          <CartesianGrid stroke={gridStroke} strokeDasharray="4 4" />
                          <XAxis dataKey="day" tickFormatter={toDayLabel} tickMargin={8} />
                          <YAxis allowDecimals={false} />
                          <ReTooltip content={chartTooltip} />
                          {dayLabel ? <ReferenceLine x={dayLabel} stroke={chartTeal} strokeDasharray="4 4" /> : null}
                          <Bar dataKey="ordersSuccess" fill={chartPurple} radius={[12, 12, 0, 0]} barSize={18} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <EmptyState text="Chưa có dữ liệu đơn thành công tháng này" />
                  )}
                </SectionCard>
              </SimpleGrid>

              <SectionCard title="Doanh thu theo tháng (1 năm)" subtitle={`Năm ${yearStr} • Jan → Dec`} right={<Pill scheme="green">YEAR</Pill>} isLoading={loading && !curData}>
                {isAdmin && compare ? (
                  <Center h="220px" border="1px dashed" borderColor={borderSoft} rounded="xl">
                    <Text fontSize="sm" color={textMuted} fontWeight="900">
                      Tắt “Compare staff” để xem biểu đồ năm.
                    </Text>
                  </Center>
                ) : revenueByMonth.length ? (
                  <Box h="320px" minW={0}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueByMonth} margin={{ top: 10, right: 16, bottom: 0, left: 36 }}>
                        <CartesianGrid stroke={gridStroke} strokeDasharray="4 4" />
                        <XAxis dataKey="month" tickFormatter={toMonthLabel} tickMargin={8} />
                        <YAxis tickFormatter={(v) => fmtNumber(v)} width={95} tickMargin={10} domain={[0, (max) => Math.ceil(max * 1.15)]} />
                        <ReTooltip content={chartTooltip} />
                        <Bar dataKey="revenue" fill={chartTeal} radius={[12, 12, 0, 0]} barSize={18} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <EmptyState text="Chưa có dữ liệu doanh thu theo năm" />
                )}
              </SectionCard>
            </TabPanel>

            {/* ======================
              DETAILS
            ====================== */}
            <TabPanel px={0}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 6 }} spacing={5} mb={6}>
                <KpiCard title="Doanh thu" value={kpi.revenue || 0} icon={CurrencyDollarIcon} format="money" trend={revenueTrend} sub="vs last month" />
                <KpiCard title="Tổng đơn" value={kpi.ordersTotal || 0} icon={ShoppingCartIcon} trend={totalTrend} sub="vs last month" />
                <KpiCard title="Đơn thành công" value={kpi.ordersSuccess || 0} icon={ShieldCheckIcon} trend={successTrend} sub="vs last month" />
                <KpiCard title="AOV" value={kpi.aov || 0} icon={ArrowTrendingUpIcon} format="money" trend={aovTrend} sub="vs last month" />
                <KpiCard title="Khách unique" value={kpi.uniqueCustomers || 0} icon={UsersIcon} trend={customerTrend} sub="vs last month" />
                <KpiCard title="Đơn huỷ" value={kpi.ordersCancelled || 0} icon={XCircleIcon} trend={cancelledTrend} sub="vs last month" />
              </SimpleGrid>

              {/* DAY DETAIL */}
              <Box ref={dayRef} />
              <SectionCard
                title="Chi tiết theo ngày"
                subtitle={dayLabel ? `Đang xem: ${fmtDayVN(dayLabel)} (${dayLabel})` : "Chọn ngày để xem chi tiết"}
                right={
                  <HStack spacing={2} flexWrap="wrap" justify="flex-end">
                    {dayLoading ? <Spinner size="sm" /> : null}
                    <Input type="date" value={selectedDate || ""} onChange={(e) => setSelectedDate(e.target.value)} maxW="190px" />
                    <Button size="sm" variant="solid" onClick={() => loadDay(selectedDate)} isLoading={dayLoading} fontWeight="900">
                      Xem ngày
                    </Button>
                    <Button size="sm" variant="outline" onClick={onPickYesterday} fontWeight="900">
                      Hôm qua
                    </Button>
                  </HStack>
                }
                isLoading={false}
              >
                {dayErr ? (
                  <Badge colorScheme="red" rounded="md" px={3} py={1} fontWeight="900" mb={4}>
                    {dayErr}
                  </Badge>
                ) : null}

                {/* Day Tabs (exactly as you requested) */}
                <Tabs variant="soft-rounded" colorScheme="purple">
                  <TabList gap={2} flexWrap="wrap" mb={4}>
                    <Tab fontWeight="900">KPI ngày</Tab>
                    <Tab fontWeight="900">Phân bổ trạng thái</Tab>
                  </TabList>

                  <TabPanels>
                    {/* KPI tab */}
                    <TabPanel px={0}>
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 6 }} spacing={5} mb={6}>
                        <KpiCard title="Doanh thu (ngày)" value={dayKpi.revenue || 0} icon={CurrencyDollarIcon} format="money" sub="Theo rule COD/paid" />
                        <KpiCard title="Tổng đơn (ngày)" value={dayKpi.ordersTotal || 0} icon={ShoppingCartIcon} sub="createdAt" />
                        <KpiCard title="Đơn thành công" value={dayKpi.ordersSuccess || 0} icon={ShieldCheckIcon} sub="paidAt" />
                        <KpiCard title="AOV" value={dayKpi.aov || 0} icon={ArrowTrendingUpIcon} format="money" sub="revenue/success" />
                        <KpiCard title="Khách unique" value={dayKpi.uniqueCustomers || 0} icon={UsersIcon} sub="paidAt" />
                        <KpiCard title="Đơn huỷ" value={dayKpi.ordersCancelled || 0} icon={XCircleIcon} sub="createdAt" />
                      </SimpleGrid>

                      <Text fontSize="sm" color={textMuted} fontWeight="900" mb={3}>
                        Xu hướng 7 ngày gần nhất (tính tới ngày đang xem)
                      </Text>

                      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
                        <SparkCard
                          title="Revenue (7d)"
                          value={fmtMoney((last7 || []).reduce((s, x) => s + Number(x.revenue || 0), 0))}
                          suffix="₫"
                          data={last7}
                          dataKey="revenue"
                          color={chartTeal}
                          note="Tổng 7 ngày"
                        />
                        <SparkCard
                          title="Success orders (7d)"
                          value={fmtNumber((last7 || []).reduce((s, x) => s + Number(x.success || 0), 0))}
                          suffix=""
                          data={last7}
                          dataKey="success"
                          color={chartPurple}
                          note="Tổng 7 ngày"
                        />
                        <SparkCard
                          title="Total orders (7d)"
                          value={fmtNumber((last7 || []).reduce((s, x) => s + Number(x.total || 0), 0))}
                          suffix=""
                          data={last7}
                          dataKey="total"
                          color={chartBlue}
                          note="Tổng 7 ngày"
                        />
                      </SimpleGrid>
                    </TabPanel>

                    {/* Status distribution tab */}
                    <TabPanel px={0}>
                      <StatusDistribution rows={dayOrdersByStatus} rowsPrev={dayOrdersByStatusPrev} />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </SectionCard>

              {/* COMPARE STAFF */}
              {isAdmin && compare ? (
                <Box mt={6}>
                  <SectionCard title="So sánh theo Staff" subtitle="Top 12 theo doanh thu" right={<Pill scheme="purple">{compareRows.length} staff</Pill>} isLoading={loading && !curData}>
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                      <Box minW={0}>
                        <Text fontSize="sm" color={textMuted} mb={3} fontWeight="900">
                          Doanh thu theo staff (Top 12)
                        </Text>

                        <Box h="320px" border="1px solid" borderColor={borderSoft} rounded="xl" p={3}>
                          {compareTop.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={compareTop} margin={{ top: 10, right: 16, bottom: 0, left: 16 }}>
                                <CartesianGrid stroke={gridStroke} strokeDasharray="4 4" />
                                <XAxis dataKey="staffId" tick={{ fontSize: 10 }} tickMargin={8} />
                                <YAxis tickFormatter={(v) => fmtNumber(v)} width={95} />
                                <ReTooltip content={chartTooltip} />
                                <Legend />
                                <Bar dataKey="revenue" fill={chartPurple} radius={[12, 12, 0, 0]} barSize={18} />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <Center h="100%">
                              <Text fontSize="sm" color={textMuted} fontWeight="800">
                                Chưa có dữ liệu compare
                              </Text>
                            </Center>
                          )}
                        </Box>
                      </Box>

                      <Box minW={0}>
                        <Text fontSize="sm" color={textMuted} mb={3} fontWeight="900">
                          Danh sách staff đã lọc
                        </Text>

                        <Box border="1px solid" borderColor={borderSoft} rounded="xl" p={3} maxH="360px" overflow="auto">
                          {compareRows.length ? (
                            <VStack align="stretch" spacing={2}>
                              {compareRows
                                .slice()
                                .sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0))
                                .map((x, idx) => (
                                  <HStack key={x._id} justify="space-between" gap={3}>
                                    <HStack spacing={2} minW={0}>
                                      <Badge rounded="md" fontWeight="900">
                                        #{idx + 1}
                                      </Badge>
                                      <Text fontFamily="mono" fontSize="xs" fontWeight="800" noOfLines={1}>
                                        {x._id}
                                      </Text>
                                    </HStack>

                                    <HStack spacing={3} flexShrink={0}>
                                      <Text fontSize="xs" fontWeight="900" whiteSpace="nowrap">
                                        {fmtMoney(x.revenue || 0)} ₫
                                      </Text>
                                      <Badge rounded="full" fontWeight="900">
                                        {fmtNumber(x.ordersSuccess || 0)}
                                      </Badge>
                                    </HStack>
                                  </HStack>
                                ))}
                            </VStack>
                          ) : (
                            <EmptyState text="Không có dữ liệu compare (hãy đảm bảo order có staff)" />
                          )}
                        </Box>
                      </Box>
                    </SimpleGrid>
                  </SectionCard>
                </Box>
              ) : null}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
}
