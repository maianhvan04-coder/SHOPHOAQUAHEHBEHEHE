import { Box, Heading, Textarea } from "@chakra-ui/react";

export default function SectionEditor({ section, onChange }) {
  return (
    <Box>
      <Heading size="sm" mb={2}>
        {section.title}
      </Heading>
      <Textarea
        value={section.content}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
      />
    </Box>
  );
}
