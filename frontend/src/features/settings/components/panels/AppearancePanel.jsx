import {
  Box,
  Card,
  CardBody,
  HStack,
  Switch,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import PropTypes from "prop-types";

export default function AppearancePanel({ colorMode, toggleColorMode }) {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const subTextColor = useColorModeValue("gray.600", "gray.400");

  return (
    <VStack spacing={8} align="start" w="full">
      <Box>
        <Text fontSize="xl" fontWeight="bold" mb={2}>
          🎨 Cài đặt giao diện
        </Text>
        <Text fontSize="sm" color={subTextColor}>
          Tùy chỉnh giao diện bảng điều khiển của bạn
        </Text>
      </Box>

      <Card
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="xl"
        shadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        w="full"
        overflow="hidden"
      >
        <Box h="2px" bgGradient="linear(to-r, purple.400, pink.400, purple.500)" />
        <CardBody>
          <HStack justify="space-between" spacing={4}>
            <Box>
              <Text fontWeight="600" fontSize="md" mb={1}>
                🌙 Chế độ tối
              </Text>
              <Text fontSize="sm" color={subTextColor}>
                Chuyển đổi giữa chủ đề sáng và tối
              </Text>
            </Box>
            <Switch
              isChecked={colorMode === "dark"}
              onChange={toggleColorMode}
              colorScheme="purple"
              size="lg"
            />
          </HStack>
        </CardBody>
      </Card>
    </VStack>
  );
}

AppearancePanel.propTypes = {
  colorMode: PropTypes.string.isRequired,
  toggleColorMode: PropTypes.func.isRequired,
};
