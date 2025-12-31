import PropTypes from "prop-types";
import { Tabs, TabList, Tab, HStack, Badge, Text, useColorModeValue } from "@chakra-ui/react";
import { UsersIcon, TrashIcon } from "@heroicons/react/24/outline";

function UsersTabs({ tab = "active", onChangeTab, activeCount, deletedCount }) {
  const index = tab === "deleted" ? 1 : 0;

  const bg = useColorModeValue("gray.50", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");
  const badgeBg = useColorModeValue("white", "gray.900");

  return (
    <Tabs
      variant="soft-rounded"
      colorScheme="vrv"
      index={index}
      onChange={(i) => onChangeTab?.(i === 0 ? "active" : "deleted")}
    >
      <TabList
        p={1}
        bg={bg}
        border="1px solid"
        borderColor={border}
        borderRadius="full"
        w="fit-content"
        gap={1}
      >
        <Tab borderRadius="full" px={4} py={2}>
          <HStack spacing={2}>
            <UsersIcon className="h-4 w-4" />
            <Text fontWeight="semibold">Users</Text>
            {typeof activeCount === "number" && (
              <Badge
                bg={badgeBg}
                border="1px solid"
                borderColor={border}
                borderRadius="full"
                px={2}
                fontSize="xs"
              >
                {activeCount}
              </Badge>
            )}
          </HStack>
        </Tab>

        <Tab borderRadius="full" px={4} py={2}>
          <HStack spacing={2}>
            <TrashIcon className="h-4 w-4" />
            <Text fontWeight="semibold">Deleted</Text>
            {typeof deletedCount === "number" && (
              <Badge
                bg={badgeBg}
                border="1px solid"
                borderColor={border}
                borderRadius="full"
                px={2}
                fontSize="xs"
              >
                {deletedCount}
              </Badge>
            )}
          </HStack>
        </Tab>
      </TabList>
    </Tabs>
  );
}

UsersTabs.propTypes = {
  tab: PropTypes.oneOf(["active", "deleted"]),
  onChangeTab: PropTypes.func,
  activeCount: PropTypes.number,
  deletedCount: PropTypes.number,
};

export default UsersTabs;
