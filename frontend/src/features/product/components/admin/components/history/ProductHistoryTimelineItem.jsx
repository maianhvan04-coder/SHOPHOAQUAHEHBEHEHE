import {
  Box,
  HStack,
  VStack,
  Text,
  Badge,
  Avatar,
  useColorModeValue,
  Icon,
  Image, // Import Image component
} from "@chakra-ui/react";
import { HiCheckCircle, HiXCircle, HiStatusOnline } from "react-icons/hi"; // Example icons

const ACTION_META = {
  create: { label: "Tạo mới", color: "green", icon: HiCheckCircle },
  update: { label: "Cập nhật", color: "blue", icon: HiStatusOnline },
  delete: { label: "Xóa", color: "red", icon: HiXCircle },
  status: { label: "Đổi trạng thái", color: "orange", icon: HiStatusOnline },
};

function diffFields(before = {}, after = {}) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...keys].filter(
    (k) => JSON.stringify(before[k]) !== JSON.stringify(after[k])
  );
}

export default function ProductHistoryTimelineItem({ log, isLast }) {
  const meta = ACTION_META[log.action] || {
    label: log.action,
    color: "gray",
    icon: null,
  };

  const lineColor = useColorModeValue("gray.200", "gray.600");
  const changedFields = diffFields(
    log.changes?.before,
    log.changes?.after
  );

  return (
    <HStack align="flex-start" spacing={4} position="relative">
      {/* LEFT: DOT + LINE */}
      <VStack spacing={0} align="center">
        <Box
          w="12px"
          h="12px"
          borderRadius="full"
          bg={`${meta.color}.500`}
          mt="6px"
        />
        {!isLast && (
          <Box flex={1} w="2px" bg={lineColor} minH="100%" />
        )}
      </VStack>

      {/* RIGHT: CONTENT */}
      <Box
        pb={6}
        flex={1}
        borderRadius="lg"
        _hover={{ bg: "blackAlpha.100" }} // Improved hover effect
        px={3}
        py={2}
        borderWidth={1}
        borderColor="gray.200"
        boxShadow="sm"
      >
        <HStack spacing={3}>
          <Avatar
            size="md"
            name={log.actorId?.fullName}
            src={log.actorId?.image?.url}
            borderWidth={2}
            borderColor={`${meta.color}.500`}
          />

          <VStack align="start" spacing={1}>
            <HStack>
              {meta.icon && <Icon as={meta.icon} color={`${meta.color}.500`} />}
              <Text fontWeight="bold" fontSize="md">
                {log.actorId?.fullName || "Hệ thống"}
              </Text>
              <Badge colorScheme={meta.color}>
                {meta.label}
              </Badge>
            </HStack>

            <Text fontSize="sm" color="gray.500">
              {new Date(log.createdAt).toLocaleString()}
            </Text>
          </VStack>
        </HStack>

        {/* PRODUCT IMAGE */}
        {log.image && (
          <Box mt={2}>
            <Image
              src={log.image.url}
              alt={log.image.publicId}
              borderRadius="md"
              boxSize="100px"
              objectFit="cover"
            />
          </Box>
        )}

        {/* DIFF */}
        {changedFields.length > 0 && (
          <VStack align="start" mt={3} spacing={1}>
            {changedFields.map((field) => (
              <HStack key={field} fontSize="sm">
                <Text fontWeight="600">{field}:</Text>
                <Text color="red.500">
                  {String(log.changes.before?.[field] ?? "—")}
                </Text>
                <Text>→</Text>
                <Text color="green.600">
                  {String(log.changes.after?.[field] ?? "—")}
                </Text>
              </HStack>
            ))}
          </VStack>
        )}
      </Box>
    </HStack>
  );
}