import { Box, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import PageHeader from "~/components/layout/admin/PageHeader";
import ProductForm from "~/features/product/components/admin/ProductForm";
import { productApi } from "~/api/productApi";

import useProductCategories from "~/features/category/hooks/useCategory";

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();

  const { categories, loading } = useProductCategories();
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);

      await productApi.create(payload);

      toast({
        title: "Tạo sản phẩm thành công 🎉",
        description: "Sản phẩm đã được thêm vào hệ thống",
        status: "success",
        duration: 2500,
        isClosable: true,
        position: "top-right",
      });

      // ⏩ delay nhẹ cho UX mượt
      setTimeout(() => {
        navigate("/admin/product");
      }, 300);
    } catch (err) {
      toast({
        title: "Tạo sản phẩm thất bại",
        description:
          err?.response?.data?.message || "Vui lòng thử lại",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box px={6} py={4} w="100%">
      <PageHeader
        title="Thêm sản phẩm"
        breadcrumb={[
          { label: "Sản phẩm", href: "/admin/product" },
          { label: "Thêm mới" },
        ]}
      />

      <Box mt={4}>
        <ProductForm
          onSubmit={handleSubmit}
          categories={categories}
          isSubmitting={submitting}
          onCancel={() => navigate("/admin/product")}
        />
      </Box>
    </Box>
  );
}
