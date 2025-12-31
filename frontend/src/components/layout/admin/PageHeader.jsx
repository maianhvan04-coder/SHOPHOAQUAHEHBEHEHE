import {
  Box,
  Button,
  Heading,
  Text,
  Stack,
  useColorModeValue,
  useBreakpointValue,
  HStack,
} from "@chakra-ui/react";
import PropTypes from "prop-types";

function PageHeader({
  title,
  description,
  buttonLabel,
  buttonIcon: Icon,
  onButtonClick,
  right, // ✅ slot bên phải (tabs/filter/chip...)
}) {
  const titleColor = useColorModeValue("gray.800", "white");
  const descColor = useColorModeValue("gray.600", "gray.300");
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      justify="space-between"
      align={{ base: "stretch", md: "center" }}
      spacing={{ base: 3, md: 4 }}
    >
      <Box>
        <Heading
          size="lg"
          mb={1}
          color={titleColor}
          letterSpacing="-0.02em"
          lineHeight="1.15"
        >
          {title}
        </Heading>

        {!!description && (
          <Text color={descColor} fontSize="sm" maxW="72ch">
            {description}
          </Text>
        )}
      </Box>

      {(buttonLabel && onButtonClick) || right ? (
        <HStack
          justify={{ base: "stretch", md: "flex-end" }}
          spacing={3}
          flexWrap="wrap"
        >
          {/* ✅ Right slot: tabs, chips, filters... */}
          {right}

          {/* ✅ Primary action */}
          {buttonLabel && onButtonClick && (
            <Button
              leftIcon={Icon ? <Icon className="h-5 w-5" /> : undefined}
              colorScheme="vrv"
              onClick={onButtonClick}
              width={{ base: "full", md: "auto" }}
              size="md"
              borderRadius="xl"
              px={5}
              _hover={{ transform: "translateY(-1px)" }}
              _active={{ transform: "translateY(0px)" }}
            >
              {buttonLabel}
            </Button>
          )}
        </HStack>
      ) : null}
    </Stack>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  buttonLabel: PropTypes.string,
  buttonIcon: PropTypes.elementType,
  onButtonClick: PropTypes.func,
  right: PropTypes.node, // ✅ new
};

export default PageHeader;
