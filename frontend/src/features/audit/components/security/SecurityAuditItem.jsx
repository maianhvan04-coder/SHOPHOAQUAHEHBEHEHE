/* eslint-disable react/prop-types */
import {
  Box,
  HStack,
  VStack,
  Text,
  Badge,
  Avatar,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

import { SECURITY_ACTION_CONFIG } from "../../config/securityAction.config";
import { RISK_LEVEL_CONFIG } from "../../config/securityRisk.config";
import { renderUserAgent } from "../../components/renderImage";

export default function SecurityAuditItem({ log }) {
  const navigate = useNavigate();

  const actionConfig = SECURITY_ACTION_CONFIG[log.action] || {
    label: log.action,
    color: "gray",
  };

  const riskConfig = RISK_LEVEL_CONFIG[log.riskLevel];

  const email =
    log.changes?.meta?.email || log.actorId?.email || "Không rõ";

  const failCount = log.changes?.meta?.failCount;
  const window = log.changes?.meta?.window;
  const reason = log.changes?.meta?.reason;

  const handleViewDetail = () => {
    navigate(`/admin/audit/security/${log._id}`);
  };

  return (
    <Box px={4} py={3} _hover={{ bg: "gray.50" }} borderRadius="md">
      <VStack align="stretch" spacing={2}>
        {/* ===== HEADER ===== */}
        <Flex justify="space-between">
          <HStack spacing={2}>
            <Avatar
              size="xs"
              name={log.actorId?.fullName || email}
              src={log.actorId?.image?.url}
            />

            <Text fontSize="sm" fontWeight="600">
              {log.actorId?.fullName || email}
            </Text>

            <Badge colorScheme={actionConfig.color} fontSize="10px">
              {actionConfig.label}
            </Badge>

            {riskConfig && (
              <Badge
                colorScheme={riskConfig.color}
                fontSize="10px"
                variant="subtle"
              >
                {riskConfig.label}
              </Badge>
            )}
          </HStack>

          <Text fontSize="xs" color="gray.500">
            {new Date(log.createdAt).toLocaleTimeString("vi-VN")}
          </Text>
        </Flex>

        {/* ===== CONTENT ===== */}
        <Box pl={6}>
          <Text fontWeight="semibold">
            {log.action === "login"
              ? "Đăng nhập thành công"
              : "Đăng nhập thất bại"}{" "}
            với email <b>{email}</b>
          </Text>

          {reason && (
            <Text fontSize="xs" color="red.500">
              Lý do: {reason}
            </Text>
          )}

          {failCount && (
            <Text fontSize="xs" color="orange.600">
              Thất bại {failCount} lần trong {window}
            </Text>
          )}
        </Box>

        {/* ===== FOOTER ===== */}
        <Flex justify="space-between" pl={6}>
          <HStack fontSize="xs" color="gray.500">
            {renderUserAgent(log)}
            <Text>| IP: {log.ip}</Text>
          </HStack>

          <HStack
            spacing={1}
            fontSize="xs"
            color="blue.500"
            cursor="pointer"
            onClick={handleViewDetail}
          >
            <Text>Chi tiết</Text>
            <Icon as={ChevronRightIcon} boxSize={3} />
          </HStack>
        </Flex>
      </VStack>
    </Box>
  );
}
