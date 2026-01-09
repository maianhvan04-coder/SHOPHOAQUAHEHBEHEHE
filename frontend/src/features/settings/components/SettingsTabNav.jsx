import { TabList, Tab, Icon, Text, useColorModeValue } from "@chakra-ui/react";
import PropTypes from "prop-types";
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
} from "@heroicons/react/24/outline";

const hoverTransition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

function TabItem({ icon, label }) {
  return (
    <Tab
      gap={2}
      px={4}
      py={3}
      borderRadius="lg"
      transition={hoverTransition}
      _selected={{
        bgGradient: "linear(to-r, blue.500, cyan.400)",
        color: "white",
        shadow: "0 4px 12px -2px rgba(59, 130, 246, 0.4)",
      }}
      _hover={{
        bg: useColorModeValue("gray.200", "gray.600"),
        transform: "translateY(-2px)",
      }}
      fontWeight="600"
    >
      <Icon as={icon} boxSize={5} />
      <Text display={{ base: "none", md: "block" }}>{label}</Text>
    </Tab>
  );
}

TabItem.propTypes = {
  icon: PropTypes.any.isRequired,
  label: PropTypes.string.isRequired,
};

export default function SettingsTabNav({ borderColor }) {
  const tabListBg = useColorModeValue(
    "rgba(255, 255, 255, 0.7)",
    "rgba(30, 30, 30, 0.7)"
  );

  return (
    <TabList
      mb={8}
      gap={3}
      flexWrap="wrap"
      p={3}
      bg={tabListBg}
      backdropFilter="blur(10px)"
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      boxShadow="0 8px 32px -8px rgba(0, 0, 0, 0.1)"
    >
      <TabItem icon={UserIcon} label="Thông tin cá nhân" />
      <TabItem icon={ShieldCheckIcon} label="Bảo mật" />
      <TabItem icon={BellIcon} label="Thông báo" />
      <TabItem icon={PaintBrushIcon} label="Giao diện" />
    </TabList>
  );
}

SettingsTabNav.propTypes = {
  borderColor: PropTypes.any,
};
