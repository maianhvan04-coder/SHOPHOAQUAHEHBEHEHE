import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Text,
  Image,
  SimpleGrid,
  Stack,
  HStack,
  Badge,
  Divider,
} from "@chakra-ui/react";

import TemplatePreview from "~/components/template/TemplatePreview";
import { mergeTemplateWithOverrides } from "~/shared/description/mergeTemplateWithOverrides";
import useDescriptionTemplates from "~/features/product/hooks/useDescriptionTemplates";

export default function ProductPreviewPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const product = state?.product;
  const { templates, loading } = useDescriptionTemplates();

  if (!product) {
    return (
      <Box p={6}>
        <Heading size="md">Không có dữ liệu preview</Heading>
        <Button mt={4} onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </Box>
    );
  }

  if (loading) {
    return <Box p={6}>Đang tải template...</Box>;
  }

  const template = templates.find(
    (t) => t.type === product.description?.templateType
  );

  const descriptionData = mergeTemplateWithOverrides(
    template,
    product.description
  );

  if (!descriptionData) {
    return (
      <Box p={6}>
        <Heading size="md">Không thể render mô tả</Heading>
        <Button mt={4} onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </Box>
    );
  }

  return (
    <Box px={6} py={6} maxW="1200px" mx="auto">
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Preview sản phẩm</Heading>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
        <Image
          src={product.images?.[0]?.url}
          alt={product.name}
          h="420px"
          objectFit="cover"
          borderRadius="2xl"
        />

        <Stack spacing={4}>
          <Badge w="fit-content" colorScheme="green">
            BÁN CHẠY
          </Badge>

          <Heading>{product.name}</Heading>

          <Text fontSize="2xl" fontWeight="bold" color="green.500">
            {product.price?.toLocaleString()} đ
          </Text>

          <Button colorScheme="green" size="lg">
            Thêm vào giỏ
          </Button>
        </Stack>
      </SimpleGrid>

      <Divider my={12} />

      <TemplatePreview
        data={{
          title: product.name,
          ...descriptionData,
        }}
        mode="production"
        allowToggle={false}
      />
    </Box>
  );
}
