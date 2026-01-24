import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Stack,
  Text,
  Box,
  Divider,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import RichTextEditor from "~/components/template/RichTextEditor"

export default function AddVersionModal({
  isOpen,
  onClose,
  onSubmit,
  baseVersion,
}) {
  const [form, setForm] = useState({
    title: "",
    intro: "",
    sections: [],
  });
  // 👉 Auto clone khi mở modal
  useEffect(() => {
    if (!isOpen || !baseVersion) return;

    setForm({
      title: `${baseVersion.title} (Bản cập nhật)`,
      intro: baseVersion.intro || "",
      sections: baseVersion.sections || [],
    });
  }, [isOpen, baseVersion]);

  const submit = () => {
    if (!form.title.trim()) return;

    onSubmit(form);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="lg">
        <ModalHeader>
          <Stack spacing={1}>
            <Text fontSize="lg" fontWeight="bold">
              Tạo phiên bản mô tả mới
            </Text>
            {baseVersion && (
              <Text fontSize="sm" color="gray.500">
                Sao chép từ version v{baseVersion.version}
              </Text>
            )}
          </Stack>
        </ModalHeader>

        <Divider />

        <ModalBody>
          <Stack spacing={5}>
            {/* SEO TITLE */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1}>
                Tiêu đề SEO (H1)
              </Text>
              <Input
                placeholder="VD: Giỏ Quà Trái Cây Cao Cấp – Quà Tặng Sức Khỏe"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Hiển thị làm tiêu đề chính của mô tả
              </Text>
            </Box>

            {/* INTRO */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1}>
                Đoạn mở đầu
              </Text>
              <RichTextEditor
  value={form.intro}
  onChange={(html) =>
    setForm({ ...form, intro: html })
  }
/>

              <Text fontSize="xs" color="gray.500" mt={1}>
                Có thể chỉnh sửa chi tiết sau khi tạo version
              </Text>
            </Box>

            {/* NOTE */}
            <Box
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              p={3}
            >
              <Text fontSize="sm" color="gray.600">
                ⚠️ Phiên bản mới sẽ <b>không ảnh hưởng</b> đến sản phẩm
                hiện tại cho đến khi bạn kích hoạt nó.
              </Text>
            </Box>
          </Stack>
        </ModalBody>

        <Divider />

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Huỷ
          </Button>
          <Button
            colorScheme="blue"
            onClick={submit}
            isDisabled={!form.title.trim()}
          >
            Tạo version mới
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
