// src/modules/orders/ui/orderUi.helpers.jsx
import React from "react";
import {
  Badge,
  HStack,
  Text,
  VStack,
  Box,
  Divider,
} from "@chakra-ui/react";

export const formatMoney = (n) => {
  const num = Number(n || 0);
  return num.toLocaleString("vi-VN") + " ₫";
};

export const toYYYYMM = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

export const toDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("vi-VN");
};

export const StatusBadge = ({ status }) => {
  const s = String(status || "").toLowerCase();
  let colorScheme = "gray";
  if (s === "pending") colorScheme = "orange";
  if (s === "processing") colorScheme = "blue";
  if (s === "delivered") colorScheme = "green";
  if (s === "cancelled") colorScheme = "red";

  return (
    <Badge colorScheme={colorScheme} variant="subtle" px={2} py={1} borderRadius="md">
      {status || "-"}
    </Badge>
  );
};

export const OrderMiniInfo = ({ order }) => {
  const ship = order?.shippingAddress || {};
  return (
    <VStack align="start" spacing={1}>
      <HStack spacing={2}>
        <Text fontWeight="semibold">#{String(order?._id || "").slice(-8)}</Text>
        <StatusBadge status={order?.status?.orderStatus} />
      </HStack>

      <Text fontSize="sm" color="gray.600">
        {toDateTime(order?.createdAt)}
      </Text>

      <Divider />

      <Box>
        <Text fontSize="sm">
          <b>Khách:</b> {ship.fullName || order?.user?.fullName || "-"}
        </Text>
        <Text fontSize="sm">
          <b>SĐT:</b> {ship.phone || order?.user?.phone || "-"}
        </Text>
        <Text fontSize="sm">
          <b>Tổng:</b> {formatMoney(order?.totalPrice)}
        </Text>
      </Box>
    </VStack>
  );
};
