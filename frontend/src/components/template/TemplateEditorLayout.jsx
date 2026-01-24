import {
  Box,
  Heading,
  Input,
  Stack,
  Button,
  Divider,
  HStack,
  FormControl,
  FormLabel,
  Card,
  CardBody,
  CardHeader,
  Text,
  Icon,
  VStack,
  Flex,
  useColorModeValue,
  Badge,
} from "@chakra-ui/react";

import {
  FiPlus,
  FiSave,
  FiEye,
  FiFileText,
  FiType,
  FiAlignLeft,
  FiLayers,
} from "react-icons/fi";

import RichTextEditor from "~/components/template/RichTextEditor";
import TemplateSectionEditor from "~/components/template/TemplateSectionEditor";

export default function TemplateEditorLayout({
  form,
  errors = {},
  loading,

  updateField,
  updateSection,
  addSection,
  removeSection,
  submit,

  onBack,
  onPreview,
  submitLabel,
  mode,
}) {
  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const sectionBg = useColorModeValue("gray.50", "gray.700");

  const isEdit = mode === "edit";

  if (!form) return null;

  return (
    <Box
      p={{ base: 4, md: 8 }}
      maxW="1600px"
      mx="auto"
      minH="100vh"
      bg={useColorModeValue("gray.50", "gray.900")}
    >
      {/* HEADER */}
      <Flex justify="space-between" align="center" mb={8}>
        <VStack align="flex-start" spacing={1}>
          <Heading size="lg" color="blue.600">
            <Icon as={FiFileText} mr={2} />
            {isEdit ? "Chỉnh Sửa Version" : "Tạo Template Mới"}
          </Heading>
          <Text fontSize="sm" color="gray.600">
            {isEdit
              ? "Cập nhật nội dung cho phiên bản mô tả"
              : "Thiết kế template mô tả dùng chung"}
          </Text>
        </VStack>

        <HStack spacing={3}>
          <Button variant="ghost" onClick={onBack}>
            ← Quay lại
          </Button>

          {onPreview && (
            <Button
              leftIcon={<Icon as={FiEye} />}
              variant="outline"
              onClick={onPreview}
            >
              Xem trước
            </Button>
          )}

          <Button
            leftIcon={<Icon as={FiSave} />}
            colorScheme="blue"
            onClick={submit}      
            isLoading={loading}
          >
            {submitLabel}
          </Button>
        </HStack>
      </Flex>

      {/* FORM */}
      <Card bg={bgCard} border="1px" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md">Cấu hình nội dung</Heading>
        </CardHeader>

        <CardBody>
          <Stack spacing={6}>
            {/* TYPE */}
            <FormControl isRequired>
              <FormLabel>
                <Icon as={FiType} mr={2} />
                Template Type
              </FormLabel>
              <Input
                value={form.type}
                isDisabled={isEdit}
                onChange={(e) =>
                  updateField("type", e.target.value)
                }
              />
            </FormControl>

            {/* TITLE */}
            <FormControl isRequired>
              <FormLabel>
                <Icon as={FiType} mr={2} />
                SEO Title (H1)
              </FormLabel>
              <Input
                value={form.title}
                onChange={(e) =>
                  updateField("title", e.target.value)
                }
              />
            </FormControl>

            {/* INTRO */}
            <FormControl isRequired>
              <FormLabel>
                <Icon as={FiAlignLeft} mr={2} />
                Giới thiệu
              </FormLabel>

              <RichTextEditor
                value={form.intro}
                onChange={(v) =>
                  updateField("intro", v)
                }
              />

              {errors.intro && (
                <Text color="red.500">{errors.intro}</Text>
              )}
            </FormControl>

            <Divider />

            {/* SECTIONS */}
            <Box>
              <Flex justify="space-between" mb={4}>
                <HStack>
                  <Icon as={FiLayers} />
                  <Heading size="sm">Sections</Heading>
                  <Badge>{form.sections.length}</Badge>
                </HStack>

                <Button
                  size="sm"
                  leftIcon={<Icon as={FiPlus} />}
                  onClick={addSection}   // ✅ FIX
                >
                  Thêm Section
                </Button>
              </Flex>

              <VStack spacing={4} align="stretch">
                {form.sections.map((s, i) => (
                  <Card key={s.key} bg={sectionBg}>
                    <TemplateSectionEditor
                      section={s}
                      index={i}
                      error={errors[`sections.${i}.content`]}
                      onChange={(data) =>
                        updateSection(i, data)   // ✅ FIX
                      }
                      onRemove={() =>
                        removeSection(i)         // ✅ FIX
                      }
                    />
                  </Card>
                ))}
              </VStack>
            </Box>
          </Stack>
        </CardBody>
      </Card>
    </Box>
  );
}
