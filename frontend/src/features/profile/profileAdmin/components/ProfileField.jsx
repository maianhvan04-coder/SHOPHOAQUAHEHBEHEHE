import { Box, HStack, Icon, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import PropTypes from "prop-types";

export default function ProfileField({ icon, label, value }) {
  const iconBg = useColorModeValue("blue.50", "whiteAlpha.100");
  const iconColor = useColorModeValue("blue.600", "blue.300");
  const textColor = useColorModeValue("gray.600", "gray.300");

  return (
    <HStack spacing={4} align="flex-start">
      <Box p={2} bg={iconBg} rounded="lg" color={iconColor}>
        <Icon as={icon} boxSize={5} />
      </Box>
      <VStack align="start" spacing={0}>
        <Text fontSize="sm" color={textColor}>
          {label}
        </Text>
        <Text fontWeight="medium">{value || "—"}</Text>
      </VStack>
    </HStack>
  );
}

ProfileField.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
