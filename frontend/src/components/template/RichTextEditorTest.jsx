import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Box, useColorModeValue } from "@chakra-ui/react";

export default function RichTextEditor({ value, onChange, minH = "200px" }) {
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const editorBg = useColorModeValue("white", "gray.800");
  const toolbarBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const focusBorderColor = useColorModeValue("blue.400", "blue.300");
  
  return (
    <Box
      borderRadius="lg"
      overflow="hidden"
      border="1px solid"
      borderColor={borderColor}
      transition="all 0.2s"
      _hover={{
        borderColor: focusBorderColor,
        shadow: "sm",
      }}
      _focusWithin={{
        borderColor: focusBorderColor,
        shadow: "md",
        transform: "translateY(-1px)",
      }}
      sx={{
        // Toolbar styling
        ".ck.ck-toolbar": {
          background: toolbarBg,
          borderBottom: `1px solid ${borderColor}`,
          borderRadius: "0",
          padding: "8px 12px",
          border: "none",
        },
        ".ck.ck-toolbar .ck-toolbar__items": {
          gap: "4px",
        },
        ".ck.ck-button": {
          borderRadius: "6px",
          transition: "all 0.2s",
          _hover: {
            background: useColorModeValue("gray.100", "gray.600"),
          },
        },
        ".ck.ck-button.ck-on": {
          background: useColorModeValue("blue.50", "blue.900"),
          color: useColorModeValue("blue.600", "blue.300"),
        },
        
        // Editor content area
        ".ck-editor__editable": {
          minHeight: minH,
          background: editorBg,
          color: textColor,
          padding: "16px",
          fontSize: "15px",
          lineHeight: "1.6",
          border: "none",
          borderRadius: "0",
          "&:focus": {
            outline: "none",
            boxShadow: "none",
          },
        },
        ".ck-editor__editable_inline": {
          border: "none",
        },
        
        // Content styling
        ".ck-content": {
          fontFamily: "inherit",
          "& p": {
            marginBottom: "12px",
          },
          "& h2, & h3, & h4": {
            marginTop: "16px",
            marginBottom: "8px",
            fontWeight: "600",
            color: textColor,
          },
          "& ul, & ol": {
            paddingLeft: "24px",
            marginBottom: "12px",
          },
          "& li": {
            marginBottom: "4px",
          },
          "& a": {
            color: useColorModeValue("blue.600", "blue.300"),
            textDecoration: "underline",
          },
          "& blockquote": {
            borderLeft: `4px solid ${useColorModeValue("gray.300", "gray.600")}`,
            paddingLeft: "16px",
            marginLeft: "0",
            fontStyle: "italic",
            color: useColorModeValue("gray.600", "gray.400"),
          },
          "& code": {
            background: useColorModeValue("gray.100", "gray.700"),
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "0.9em",
            fontFamily: "monospace",
          },
          "& pre": {
            background: useColorModeValue("gray.100", "gray.700"),
            padding: "12px",
            borderRadius: "6px",
            overflow: "auto",
            marginBottom: "12px",
          },
        },
        
        // Dropdown styling
        ".ck.ck-dropdown__panel": {
          background: editorBg,
          borderColor: borderColor,
          borderRadius: "8px",
          boxShadow: "lg",
        },
        
        // Balloon panel (tooltips)
        ".ck.ck-balloon-panel": {
          background: editorBg,
          borderColor: borderColor,
          borderRadius: "8px",
          boxShadow: "lg",
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
        data={value}
        onChange={(_, editor) => {
          onChange(editor.getData());
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
          placeholder: "Nhập nội dung của bạn tại đây...",
        }}
      />
    </Box>
  );
}