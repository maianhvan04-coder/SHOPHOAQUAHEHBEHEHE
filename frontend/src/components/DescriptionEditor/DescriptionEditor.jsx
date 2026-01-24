/* eslint-disable react/prop-types */
import {
  Box,
  FormControl,
  FormLabel,
  Select,
  VStack,
  Divider,
  Text,
  Badge,
  HStack,
  Spinner,
} from "@chakra-ui/react";

import useDescriptionTemplates from "~/features/product/hooks/useDescriptionTemplates";
import useProductDescription from "~/features/product/hooks/useProductDescription";
import RichTextEditor from "~/components/template/RichTextEditor";

export default function DescriptionEditor({ value, onChange }) {
  const { templates, loading } = useDescriptionTemplates();

  const {
    templateType,
    templateVersion,
    intro,
    overrides,
    template,
    version,
    selectTemplate,
    updateIntro,
    updateSection,
  } = useProductDescription({
    value,
    templates,
    onChange,
  });

  return (
    <Box borderWidth="1px" borderRadius="xl" p={4}>
      <VStack spacing={4} align="stretch">
        {/* ================= TEMPLATE SELECT ================= */}
        <FormControl>
          <FormLabel>Mẫu mô tả</FormLabel>
          <Select
            value={templateType}
            isDisabled={loading}
            onChange={(e) => selectTemplate(e.target.value)}
          >
            <option value="">Chọn mẫu</option>
            {templates.map((t) => (
              <option key={t.type} value={t.type}>
                {t.type}
              </option>
            ))}
          </Select>
        </FormControl>

        {loading && (
          <HStack justify="center" py={6}>
            <Spinner />
          </HStack>
        )}

        {/* ================= EDITOR ================= */}
        {!loading && template && version && (
          <>
            <Divider />

            {/* ===== INTRO ===== */}
            <FormControl>
              <FormLabel>Giới thiệu</FormLabel>
              <RichTextEditor
                value={intro}
                minH="180px"
                onChange={updateIntro}
              />
            </FormControl>

            {/* ===== SECTIONS ===== */}
            {version.sections.map((s) => {
              const overridden = overrides[s.key] !== undefined;
              const content =
                overrides[s.key] ?? s.content ?? "";

              return (
                <FormControl key={s.key}>
                  <HStack mb={1} spacing={2}>
                    <FormLabel mb={0}>{s.title}</FormLabel>

                    {overridden && (
                      <Badge
                        colorScheme="blue"
                        fontSize="xs"
                      >
                        Override
                      </Badge>
                    )}
                  </HStack>

                  <RichTextEditor
                    value={content}
                    minH="140px"
                    onChange={(val) =>
                      updateSection(
                        s.key,
                        val,
                        s.content
                      )
                    }
                  />

                  {!overridden && (
                    <Text
                      fontSize="xs"
                      color="gray.500"
                      mt={1}
                    >
                      Nội dung mặc định từ template
                    </Text>
                  )}
                </FormControl>
              );
            })}

            <Text fontSize="xs" color="gray.500">
              Template: <b>{templateType}</b> • Version:{" "}
              <b>{version.version}</b>
            </Text>
          </>
        )}
      </VStack>
    </Box>
  );
}
