import {
  Box,
  Spinner,
  Center,
  useToast,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import PageHeader from "~/components/layout/admin/PageHeader";
import ProductForm from "~/features/product/components/admin/ProductForm";
import { productApi } from "~/api/productApi";
import useProductCategories from "~/features/category/hooks/useCategory";

export default function ProductEditPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams();

  const { categories, loading: loadingCategories } =
    useProductCategories();

  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productApi.getById(id);
        setProduct(res.data.data);
      } catch (err) {
        toast({
          title: "Không thể tải sản phẩm",
          description:
            err?.response?.data?.message || "Vui lòng thử lại",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [id, toast]);

  /* ================= LOADING ================= */
  if (loadingCategories || loadingProduct) {
    return (
      <Center py={10}>
        <Spinner size="lg" />
      </Center>
    );
  }

  if (!product) return null;

  /* ================= SUBMIT ================= */
  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);

      await productApi.update(id, payload);

      // toast({
      //   title: "Cập nhật sản phẩm thành công ✅",
      //   description: "Thông tin sản phẩm đã được lưu",
      //   status: "success",
      //   duration: 2500,
      //   isClosable: true,
      //   position: "top-right",
      // });

      // setTimeout(() => {
      //   navigate("/admin/product");
      // }, 300);
    } catch (err) {
      toast({
        title: "Cập nhật thất bại",
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
        title="Cập nhật sản phẩm"
        breadcrumb={[
          { label: "Sản phẩm", href: "/admin/product" },
          { label: product.name },
        ]}
      />

      <Box mt={4}>
        <ProductForm
          product={product}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin/product")}
          isSubmitting={submitting}
        />
      </Box>
    </Box>
  );
}
