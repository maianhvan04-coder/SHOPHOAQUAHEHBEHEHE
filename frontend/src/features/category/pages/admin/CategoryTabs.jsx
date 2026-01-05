import PropTypes from "prop-types";
import { HStack, Box, Text, Badge, useColorModeValue } from "@chakra-ui/react";

export default function CategoryTabs({ tab, onChangeTab, activeCount, deletedCount }) {
  const activeBg = useColorModeValue("gray.200", "whiteAlpha.200");
  const hoverBg = useColorModeValue("gray.100", "whiteAlpha.100");
  const activeText = useColorModeValue("gray.900", "white");
  const inactiveText = useColorModeValue("gray.600", "gray.300");

  const pill = (isActive) => ({
    px: 4,
    py: 2.5,
    borderRadius: "full",
    cursor: "pointer",
    bg: isActive ? activeBg : "transparent",
    transition: "all 0.15s",
    _hover: { bg: isActive ? activeBg : hoverBg },
  });

  return (
    <HStack spacing={6}>
      <Box {...pill(tab === "active")} onClick={() => onChangeTab?.("active")}>
        <HStack spacing={2}>
          <Text fontWeight="semibold" color={tab === "active" ? activeText : inactiveText}>
            Categories
          </Text>
          <Badge borderRadius="full" px={2}>
            {activeCount}
          </Badge>
        </HStack>
      </Box>

      <Box {...pill(tab === "deleted")} onClick={() => onChangeTab?.("deleted")}>
        <HStack spacing={2}>
          <Text fontWeight="semibold" color={tab === "deleted" ? activeText : inactiveText}>
            Deleted
          </Text>
          <Badge borderRadius="full" px={2} colorScheme={deletedCount > 0 ? "red" : "gray"}>
            {deletedCount}
          </Badge>
        </HStack>
      </Box>
    </HStack>
  );
}

CategoryTabs.propTypes = {
  tab: PropTypes.oneOf(["active", "deleted"]).isRequired,
  onChangeTab: PropTypes.func.isRequired,
  activeCount: PropTypes.number,
  deletedCount: PropTypes.number,
};
