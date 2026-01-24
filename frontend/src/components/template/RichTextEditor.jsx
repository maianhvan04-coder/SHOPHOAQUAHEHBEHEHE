import { useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Box, useColorModeValue, VStack } from "@chakra-ui/react";

import { CkUploadAdapterPlugin } from "~/features/template/hooks/ckUploadAdapter";


export default function RichTextEditor({ value, onChange, minH = "200px" }) {


  const borderColor = useColorModeValue("gray.300", "gray.600");
  const editorBg = useColorModeValue("white", "gray.800");
  const toolbarBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const focusBorderColor = useColorModeValue("blue.400", "blue.300");

  return (
    <VStack align="stretch" spacing={2}>
    
      {/* ===== EDITOR ===== */}
      <Box
        borderRadius="lg"
        overflow="hidden"
        border="1px solid"
        borderColor={borderColor}
        _focusWithin={{
          borderColor: focusBorderColor,
          shadow: "md",
        }}
        sx={{
          ".ck-content figure.image": {
            maxWidth: "100%",
          },
          ".ck-content figure.image img": {
            width: "100%",
            height: "auto",
          },
          ".ck.ck-toolbar": {
            background: toolbarBg,
            borderBottom: `1px solid ${borderColor}`,
            border: "none",
          },
          ".ck-editor__editable": {
            minHeight: minH,
            background: editorBg,
            color: textColor,
            padding: "16px",
            fontSize: "15px",
            lineHeight: "1.6",
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
            extraPlugins: [CkUploadAdapterPlugin],

            toolbar: [
              "heading",
              "|",
              "bold",
              "italic",
              "link",
              "bulletedList",
              "numberedList",
              "|",
              "imageUpload",
              "blockQuote",
              "insertTable",
              "|",
              "undo",
              "redo",
            ],

            placeholder: "Nhập nội dung của bạn tại đây...",
          }}
        />
      </Box>
    </VStack>
  );
}
