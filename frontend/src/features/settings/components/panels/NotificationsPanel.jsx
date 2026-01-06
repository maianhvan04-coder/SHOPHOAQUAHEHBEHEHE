// src/features/settings/components/panels/NotificationsPanel.jsx
import {
  Card,
  CardBody,
  Divider,
  HStack,
  Stack,
  Switch,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

export default function NotificationsPanel({
  notifications = {},            // ✅ default để khỏi undefined
  onToggleNotification = () => {}, // ✅ fallback
}) {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const subTextColor = useColorModeValue("gray.600", "gray.400");

  const items = [
    { key: "email", title: "Email", desc: "Nhận thông báo qua email" },
    { key: "push", title: "Push", desc: "Nhận push notification" },
    { key: "updates", title: "Updates", desc: "Thông báo cập nhật hệ thống" },
  ];

  return (
    <Stack spacing={4}>
      <Text fontSize="lg" fontWeight="700">
        Thông báo
      </Text>

      <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl">
        <CardBody>
          <Stack spacing={4}>
            {items.map((it, idx) => (
              <Stack key={it.key} spacing={3}>
                <HStack justify="space-between">
                  <Stack spacing={0}>
                    <Text fontWeight="600">{it.title}</Text>
                    <Text fontSize="sm" color={subTextColor}>
                      {it.desc}
                    </Text>
                  </Stack>

                  <Switch
                    isChecked={!!notifications?.[it.key]}   // ✅ safe
                    onChange={() => onToggleNotification(it.key)}
                    colorScheme="blue"
                  />
                </HStack>

                {idx < items.length - 1 && <Divider />}
              </Stack>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}

