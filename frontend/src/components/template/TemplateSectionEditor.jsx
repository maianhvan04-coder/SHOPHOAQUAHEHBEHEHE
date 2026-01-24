import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { 
  Box, 
  Input, 
  IconButton, 
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Badge,
  Tooltip,
  useColorModeValue,
  Icon,
  Text,
  Flex,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { FiType, FiAlignLeft, FiTrash2 } from "react-icons/fi";

export default function TemplateSectionEditor({
  section,
  onChange,
  onRemove,
  error,
  index,
}) {
  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const sectionBg = useColorModeValue("gray.50", "gray.700");
  const accentColor = useColorModeValue("blue.500", "blue.300");

  return (
    <Box
      bg={bgCard}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
      shadow="sm"
      transition="all 0.3s"
      _hover={{ 
        shadow: "md",
        borderColor: accentColor,
      }}
      position="relative"
    >
      {/* Section Header */}
      <Flex
        bg={sectionBg}
        px={5}
        py={3}
        borderBottom="1px solid"
        borderColor={borderColor}
        justify="space-between"
        align="center"
      >
        <HStack spacing={3}>
          <Box
            w="3px"
            h="20px"
            bg={accentColor}
            borderRadius="full"
          />
          <Badge 
            colorScheme="purple" 
            fontSize="xs"
            px={3}
            py={1}
            borderRadius="full"
            fontWeight="semibold"
          >
            Phần {index !== undefined ? index + 1 : ''}
          </Badge>
          <Text 
            fontSize="sm" 
            fontWeight="medium" 
            color={useColorModeValue("gray.700", "gray.300")}
          >
            Nội dung section
          </Text>
        </HStack>

        {onRemove && (
          <Tooltip label="Xóa phần này" placement="top" hasArrow>
            <IconButton
              icon={<Icon as={FiTrash2} />}
              onClick={onRemove}
              size="sm"
              colorScheme="red"
              variant="ghost"
              aria-label="Xóa section"
              _hover={{
                bg: useColorModeValue("red.50", "red.900"),
                transform: "scale(1.1)",
              }}
              transition="all 0.2s"
            />
          </Tooltip>
        )}
      </Flex>

      {/* Section Content */}
      <VStack spacing={5} p={5} align="stretch">
        {/* Title Input */}
        <FormControl>
          <FormLabel 
            fontSize="sm" 
            fontWeight="semibold"
            color={useColorModeValue("gray.700", "gray.300")}
            mb={2}
          >
            <HStack spacing={2}>
              <Icon as={FiType} color={accentColor} />
              <Text>Tiêu đề phần</Text>
            </HStack>
          </FormLabel>
          <Input
            value={section.title}
            placeholder="Nhập tiêu đề cho phần này..."
            onChange={(e) =>
              onChange({ title: e.target.value })
            }
            size="lg"
            focusBorderColor={accentColor}
            bg={useColorModeValue("white", "gray.900")}
            _placeholder={{ 
              color: useColorModeValue("gray.400", "gray.500") 
            }}
            _hover={{
              borderColor: useColorModeValue("gray.300", "gray.600"),
            }}
          />
        </FormControl>

        {/* Content Editor */}
        <FormControl>
          <FormLabel 
            fontSize="sm" 
            fontWeight="semibold"
            color={useColorModeValue("gray.700", "gray.300")}
            mb={2}
          >
            <HStack spacing={2}>
              <Icon as={FiAlignLeft} color={accentColor} />
              <Text>Nội dung chi tiết</Text>
            </HStack>
          </FormLabel>
          <Box
            borderRadius="lg"
            overflow="hidden"
            border="1px solid"
            borderColor={borderColor}
            transition="all 0.2s"
            _hover={{
              borderColor: accentColor,
              shadow: "sm",
            }}
            _focusWithin={{
              borderColor: accentColor,
              shadow: "md",
            }}
            sx={{
              // Toolbar styling
              ".ck.ck-toolbar": {
                background: sectionBg,
                borderBottom: `1px solid ${borderColor}`,
                borderRadius: "0",
                padding: "8px 12px",
                border: "none",
              },
              ".ck.ck-button": {
                borderRadius: "6px",
                transition: "all 0.2s",
              },
              ".ck.ck-button:hover": {
                background: useColorModeValue("gray.100", "gray.600"),
              },
              ".ck.ck-button.ck-on": {
                background: useColorModeValue("blue.50", "blue.900"),
                color: accentColor,
              },
              
              // Editor content area
              ".ck-editor__editable": {
                minHeight: "200px",
                background: useColorModeValue("white", "gray.900"),
                padding: "16px",
                fontSize: "15px",
                lineHeight: "1.6",
                border: "none",
                borderRadius: "0",
                color: useColorModeValue("gray.800", "gray.100"),
              },
              ".ck-editor__editable:focus": {
                outline: "none",
                boxShadow: "none",
              },
              ".ck-editor__editable_inline": {
                border: "none",
              },
              
              // Content styling
              ".ck-content p": {
                marginBottom: "12px",
              },
              ".ck-content h2, .ck-content h3, .ck-content h4": {
                marginTop: "16px",
                marginBottom: "8px",
                fontWeight: "600",
              },
              ".ck-content ul, .ck-content ol": {
                paddingLeft: "24px",
                marginBottom: "12px",
              },
              ".ck-content a": {
                color: accentColor,
                textDecoration: "underline",
              },
              
              // Remove default borders
              ".ck.ck-editor__main > .ck-editor__editable": {
                border: "none",
              },
              ".ck.ck-editor__top .ck-sticky-panel .ck-toolbar": {
                border: "none",
              },
            }}
          >
            <CKEditor
              editor={ClassicEditor}
              data={section.content}
              onChange={(_, editor) => {
                onChange({ content: editor.getData() });
              }}
              config={{
                toolbar: [
                  'heading',
                  '|',
                  'bold',
                  'italic',
                  'link',
                  'bulletedList',
                  'numberedList',
                  '|',
                  'blockQuote',
                  'insertTable',
                  '|',
                  'undo',
                  'redo'
                ],
                placeholder: "Nhập nội dung chi tiết cho phần này...",
              }}
            />

             {error && (
    <Text color="red.500" fontSize="sm" mt={1}>
      {error}
    </Text>
  )}
          </Box>
        </FormControl>
      </VStack>

      {/* Decorative accent line at bottom */}
      <Box
        h="3px"
        bg={`linear-gradient(to right, ${accentColor}, transparent)`}
        opacity="0.3"
      />
    </Box>
  );
}