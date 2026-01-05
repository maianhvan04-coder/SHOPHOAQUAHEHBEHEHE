import PropTypes from "prop-types";
import { Tabs, TabList, Tab, HStack, Badge } from "@chakra-ui/react";

function ProductsTabs({ tab = "active", onChangeTab, activeCount = 0, deletedCount = 0 }) {
  const index = tab === "deleted" ? 1 : 0;

  return (
    <Tabs
      variant="soft-rounded"
      colorScheme="vrv"
      index={index}
      onChange={(i) => onChangeTab?.(i === 0 ? "active" : "deleted")}
    >
      <TabList gap={2}>
        <Tab>
          <HStack spacing={2}>
            <span>Products</span>
            <Badge borderRadius="full" colorScheme="vrv" variant="subtle">
              {activeCount}
            </Badge>
          </HStack>
        </Tab>
        <Tab>
          <HStack spacing={2}>
            <span>Deleted</span>
            <Badge borderRadius="full" colorScheme="red" variant="subtle">
              {deletedCount}
            </Badge>
          </HStack>
        </Tab>
      </TabList>
    </Tabs>
  );
}

ProductsTabs.propTypes = {
  tab: PropTypes.oneOf(["active", "deleted"]),
  onChangeTab: PropTypes.func,
  activeCount: PropTypes.number,
  deletedCount: PropTypes.number,
};

export default ProductsTabs;
