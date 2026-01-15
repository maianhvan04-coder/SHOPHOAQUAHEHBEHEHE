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
  Button,
} from "@chakra-ui/react";
import {
  PencilSquareIcon,
  CheckCircleIcon,
  TrashIcon,
  SparklesIcon,
  ChevronRightIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const ACTION_CONFIG = {
  create: { color: "green", label: "Tạo", icon: SparklesIcon },
  update: { color: "blue", label: "Sửa", icon: PencilSquareIcon },
  delete: { color: "red", label: "Xóa", icon: TrashIcon },
  status: { color: "orange", label: "Trạng thái", icon: CheckCircleIcon },
};

export default function ProductAuditItem({ log }) {
   const navigate = useNavigate();
  const config = ACTION_CONFIG[log.action] || {
    color: "gray",
    label: log.action,
    icon: CheckCircleIcon,
  };

  const productName =
    log.changes?.after?.name ||
    log.changes?.before?.name ||
    "Không rõ";
const handleViewDetail = () => {
    navigate(`/admin/audit/product/${log._id}`);
  };
  return (
    <Box px={4} py={3} _hover={{ bg: "gray.50" }} borderRadius="md">
      <VStack align="stretch" spacing={2}>
        <Flex justify="space-between">
          <HStack spacing={2}>
            <Avatar size="xs" name={log.actorId?.fullName} />
            <Text fontSize="sm" fontWeight="600">
              {log.actorId?.fullName}
            </Text>

            <Badge colorScheme={config.color} fontSize="10px">
              {config.label}
            </Badge>

            {log.actorRoles?.map((r) => (
              <Badge
                key={r}
                fontSize="10px"
                colorScheme="purple"
                variant="subtle"
              >
                {r.replace("_", " ")}
              </Badge>
            ))}
          </HStack>

          <Text fontSize="xs" color="gray.500">
            {new Date(log.createdAt).toLocaleTimeString("vi-VN")}
          </Text>
        </Flex>

        <Text fontWeight="semibold" pl={6}>
          {productName}
        </Text>

        <Flex justify="space-between" pl={6}>
          <HStack fontSize="xs" color="gray.500">
            <Icon as={DevicePhoneMobileIcon} w={3} h={3} />
            <Text>{log.userAgent?.browser?.name}</Text>
            <Text>•</Text>
            <Text fontFamily="mono">{log.ip}</Text>
          </HStack>

          <Button
            size="xs"
            variant="ghost"
            colorScheme={config.color}
            rightIcon={<ChevronRightIcon className="w-3 h-3" />}
            onClick={handleViewDetail}
          >
            Chi tiết
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}
