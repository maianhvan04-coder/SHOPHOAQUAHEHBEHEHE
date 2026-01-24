import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  Icon,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiArrowLeft, FiSave, FiEye } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import TemplatePreview from "~/components/template/TemplatePreview";
import { useTemplateCreate } from "~/features/template/hooks/useTemplateCreate";

export default function TemplatePreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Ưu tiên state, fallback sessionStorage trong hook
  const initialForm = location.state?.form;

  const { form, submit, loading } = useTemplateCreate(initialForm);

  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");


  useEffect(() => {
    if (!form?.type) {
      navigate("/admin/templates/create", { replace: true });
    }
  }, [form, navigate]);

  if (!form) return null;

  return (
    <Box p={8} maxW="1200px" mx="auto">
      <Card
        bg={bgCard}
        border="1px"
        borderColor={borderColor}
        borderRadius="xl"
        shadow="lg"
      >
        <CardHeader>
          <HStack justify="space-between">
            <HStack>
              <Icon as={FiEye} color="blue.500" />
              <Heading size="md">Xem trước Template</Heading>
            </HStack>

            <HStack spacing={3}>
              <Button
                leftIcon={<Icon as={FiArrowLeft} />}
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Quay lại chỉnh sửa
              </Button>

              <Button
                leftIcon={<Icon as={FiSave} />}
                colorScheme="blue"
                isLoading={loading}
                onClick={submit}
              >
                Tạo Template
              </Button>
            </HStack>
          </HStack>

          <Text fontSize="sm" color="gray.500" mt={2}>
            Chế độ xem trước (read-only). Kiểm tra nội dung trước khi tạo template.
          </Text>
        </CardHeader>

        <CardBody>
          <Box
            p={6}
            bg={useColorModeValue("gray.50", "gray.900")}
            borderRadius="lg"
          >
            {/* 🔒 Preview chỉ đọc */}
            <TemplatePreview data={form} readOnly />
          </Box>
        </CardBody>
      </Card>
    </Box>
  );
}
