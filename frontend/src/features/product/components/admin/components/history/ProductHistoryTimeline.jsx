// ProductHistoryTimeline.jsx
import { VStack } from "@chakra-ui/react";
import ProductHistoryTimelineItem from "./ProductHistoryTimelineItem";

export default function ProductHistoryTimeline({ items }) {
  return (
    <VStack align="stretch" spacing={0}>
      {items.map((log, index) => (
        <ProductHistoryTimelineItem
          key={log._id}
          log={log}
          isLast={index === items.length - 1}
        />
      ))}
    </VStack>
  );
}
