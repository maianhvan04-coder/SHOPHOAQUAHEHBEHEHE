import PropTypes from "prop-types";
import { Tag, Tooltip } from "@chakra-ui/react";
import { StarIcon } from "@heroicons/react/24/outline";
import { stop } from "../products.helpers";

export default function FeaturedBadge({ p }) {
  if (!p?.isFeatured) return null;

  return (
    <Tooltip label={`Thứ hạng nổi bật: ${p?.featuredRank ?? 0}`} hasArrow>
      <Tag
        size="sm"
        colorScheme="yellow"
        borderRadius="full"
        px={2.5}
        py={0.5}
        onClick={stop}
        cursor="default"
        userSelect="none"
      >
        <StarIcon className="h-3.5 w-3.5 fill-current" style={{ marginRight: 6 }} />
        VIP
      </Tag>
    </Tooltip>
  );
}

FeaturedBadge.propTypes = {
  p: PropTypes.object,
};
