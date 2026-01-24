import {
  Box,
  Heading,
  Text,
  VStack,
  Divider,
  useColorModeValue,
  Badge,
  Icon,
  HStack,
  Button
} from "@chakra-ui/react";
import { FiFileText, FiAlignLeft } from "react-icons/fi";
import { useState } from "react";
export default function TemplatePreview({ data ,mode: controlledMode, // optional
  allowToggle = true,}) {
  const [mode, setMode] = useState(
  controlledMode || "admin"
);

const isProduction = mode === "production";
    
  
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("gray.800", "gray.100");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const sectionBg = useColorModeValue("gray.50", "gray.900");
  const accentColor = useColorModeValue("blue.500", "blue.300");

  if (!data) return null;

  const hasContent =
    data.title || data.intro || data.sections?.length > 0;

  return (
    
    <Box
      bg={isProduction ? "transparent" : bgColor}
      borderRadius={isProduction ? "0" : "xl"}
      border={isProduction ? "none" : "1px solid"}
      borderColor={borderColor}
      shadow={isProduction ? "none" : "sm"}
    >
      {/* MODE TOGGLE */}
{allowToggle && (
  <HStack
    justify="flex-end"
    px={isProduction ? 0 : 6}
    py={3}
    borderBottom={isProduction ? "none" : "1px solid"}
    borderColor="gray.200"
  >
    <Button
      size="xs"
      variant={mode === "admin" ? "solid" : "outline"}
      onClick={() => setMode("admin")}
    >
      Admin View
    </Button>

    <Button
      size="xs"
      variant={mode === "production" ? "solid" : "outline"}
      onClick={() => setMode("production")}
    >
      Production View
    </Button>
  </HStack>
)}

      {!hasContent ? (
        !isProduction && (
          <VStack py={16} spacing={4} textAlign="center">
            <Icon as={FiFileText} boxSize={16} color="gray.300" />
            <Heading size="md" color="gray.400">
              Chưa có nội dung
            </Heading>
            <Text fontSize="sm" color="gray.400">
              Bắt đầu điền thông tin để xem preview
            </Text>
          </VStack>
        )
      ) : (
        <VStack spacing={0} align="stretch">
          {/* =====================
              HEADER (H1 + INTRO)
              ===================== */}
          {(data.title || data.intro) && (
            <Box
              p={isProduction ? 0 : 8}
              borderBottom={
                isProduction ? "none" : "1px solid"
              }
              borderColor={borderColor}
              position="relative"
            >
              {data.title && (
                <Heading
                  as="h1"
                  size="xl"
                  mb={4}
                  color={headingColor}
                >
                  {data.title}
                </Heading>
              )}

              {data.intro && (
                <Box
                  color={textColor}
                  lineHeight="1.7"
                  dangerouslySetInnerHTML={{
                    __html: data.intro,
                  }}
                  sx={{
                    "& p": { mb: 4 },
                  }}
                />
              )}
            </Box>
          )}

          {/* =====================
              SECTIONS (H2/H3)
              ===================== */}
          {data.sections?.length > 0 && (
            <Box p={isProduction ? 0 : 8}>
              {data.sections.map((s, index) => (
                <Box
                  key={s.key}
                  as="section"
                  mt={index === 0 ? 0 : 12}
                  p={
                    isProduction
                      ? 0
                      : 6
                  }
                  bg={
                    isProduction
                      ? "transparent"
                      : sectionBg
                  }
                  borderRadius={
                    isProduction
                      ? "0"
                      : "lg"
                  }
                  border={
                    isProduction
                      ? "none"
                      : "1px solid"
                  }
                  borderColor={borderColor}
                >
                  {s.title && (
                    <Heading
                      as="h2"
                      size="lg"
                      mb={4}
                      color={headingColor}
                    >
                      {s.title}
                    </Heading>
                  )}

                  {s.content && (
                    <Box
                      color={textColor}
                      lineHeight="1.8"
                      dangerouslySetInnerHTML={{
                        __html: s.content,
                      }}
                      sx={{
                        "& h3": {
                          fontSize: "lg",
                          fontWeight: 600,
                          mt: 6,
                          mb: 2,
                        },
                        "& p": { mb: 4 },
                        "& ul, & ol": {
                          pl: 6,
                          mb: 4,
                        },
                      }}
                    />
                  )}

                  {!isProduction &&
                    !s.title &&
                    !s.content && (
                      <HStack
                        spacing={2}
                        color="gray.400"
                        fontStyle="italic"
                        mt={2}
                      >
                        <Icon as={FiAlignLeft} />
                        <Text>
                          Phần {index + 1} - Chưa có nội dung
                        </Text>
                      </HStack>
                    )}
                </Box>
              ))}
            </Box>
          )}

          {/* =====================
              FOOTER (ADMIN ONLY)
              ===================== */}
          {!isProduction && hasContent && (
            <Box
              px={8}
              py={4}
              borderTop="1px solid"
              borderColor={borderColor}
              bg={useColorModeValue(
                "gray.50",
                "gray.900"
              )}
            >
              <HStack
                fontSize="xs"
                color="gray.500"
                justify="space-between"
              >
                <Text>Template Preview</Text>
                <Badge variant="subtle">
                  {data.sections?.length || 0} phần
                </Badge>
              </HStack>
            </Box>
          )}
        </VStack>
      )}
    </Box>
  );
}
