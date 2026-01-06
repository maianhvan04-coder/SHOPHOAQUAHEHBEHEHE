/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  Switch,
  Text,
  Textarea,
  VStack,
  useColorModeValue,
  FormErrorMessage,
} from "@chakra-ui/react";

import ImageUploader from "~/features/upload/ImageUploader";
import { uploadToCloudinarySigned } from "~/features/upload/cloudinaryUpload";

// ===== helpers =====
function isNonEmptyString(s) {
  return typeof s === "string" && s.trim().length > 0;
}

function toNumberOrNaN(v) {
  if (v === null || v === undefined) return NaN;
  const s = String(v).trim();
  if (s === "") return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

export default function ProductForm({
  product,
  categories = [],
  onSubmit,
  onCancel,
  isSubmitting,
}) {
  const borderColor = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
  const inputBg = useColorModeValue("white", "gray.900");

  // refs focus lỗi
  const nameRef = useRef(null);
  const categoryRef = useRef(null);
  const priceRef = useRef(null);
  const stockRef = useRef(null);
  const soldRef = useRef(null);
  const ratingRef = useRef(null);
  const rankRef = useRef(null);

  // ✅ TẤT CẢ INPUT SỐ = STRING
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    sold: "",
    rating: "",
    description: "",
    isFeatured: false,
    featuredRank: "",
    isActive: true,
  });

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  // edit mode
  useEffect(() => {
    if (!product) return;

    setForm({
      name: product?.name ?? "",
      category:
        product?.category?._id ||
        product?.categoryId ||
        product?.category ||
        "",
      price: product?.price != null ? String(product.price) : "",
      stock: product?.stock != null ? String(product.stock) : "",
      sold: product?.sold != null ? String(product.sold) : "",
      rating: product?.rating != null ? String(product.rating) : "",
      description: product?.description ?? "",
      isFeatured: !!product?.isFeatured,
      featuredRank:
        product?.featuredRank != null ? String(product.featuredRank) : "",
      isActive: product?.isActive ?? true,
    });

    setImages(Array.isArray(product?.images) ? product.images : []);
    setErrors({});
  }, [product]);

  const selectedCategoryLabel = useMemo(() => {
    const found = categories.find(
      (c) => String(c._id) === String(form.category)
    );
    return found?.name || "";
  }, [categories, form.category]);

  // ===== validate =====
  const validate = () => {
    const next = {};

    if (!isNonEmptyString(form.name))
      next.name = "Vui lòng nhập tên sản phẩm.";

    if (!isNonEmptyString(form.category))
      next.category = "Vui lòng chọn danh mục.";

    const price = toNumberOrNaN(form.price);
    if (!Number.isFinite(price) || price < 0)
      next.price = "Giá không hợp lệ.";

    const stock = form.stock === "" ? 0 : toNumberOrNaN(form.stock);
    if (!Number.isFinite(stock) || stock < 0)
      next.stock = "Tồn kho không hợp lệ.";

    // const sold = form.sold === "" ? 0 : toNumberOrNaN(form.sold);
    // if (!Number.isFinite(sold) || sold < 0)
    //   next.sold = "Đã bán không hợp lệ.";
    // else if (sold > stock)
    //   next.sold = "Đã bán không được lớn hơn tồn kho.";

    const rating = form.rating === "" ? 0 : toNumberOrNaN(form.rating);
    if (!Number.isFinite(rating) || rating < 0 || rating > 5)
      next.rating = "Đánh giá phải từ 0 đến 5.";

    if (form.isFeatured) {
      const rank = toNumberOrNaN(form.featuredRank);
      if (!Number.isFinite(rank) || rank <= 0)
        next.featuredRank = "Thứ hạng nổi bật không hợp lệ.";
    }

    if (!images.length) next.images = "Vui lòng tải ít nhất 1 ảnh.";

    return next;
  };

  const focusFirstError = (e) => {
    if (e.name) return nameRef.current?.focus();
    if (e.category) return categoryRef.current?.focus();
    if (e.price) return priceRef.current?.focus();
    if (e.stock) return stockRef.current?.focus();
    // if (e.sold) return soldRef.current?.focus();
    if (e.rating) return ratingRef.current?.focus();
    if (e.featuredRank) return rankRef.current?.focus();
  };

  const submit = (e) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      focusFirstError(nextErrors);
      return;
    }

    // ✅ convert sang number TẠI ĐÂY
    const payload = {
      name: form.name.trim(),
      description: form.description ?? "",
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock || 0),
      // sold: Number(form.sold || 0),
      rating: Number(form.rating || 0),
      isFeatured: !!form.isFeatured,
      featuredRank: Number(form.featuredRank || 0),
      isActive: !!form.isActive,
      images,
      image: images[0],
    };

    onSubmit?.(payload);
  };

  return (
    <Box as="form" onSubmit={submit}>
      <VStack spacing={4} align="stretch">
        {/* NAME */}
        <FormControl isInvalid={!!errors.name}>
          <FormLabel>Tên sản phẩm</FormLabel>
          <Input
            ref={nameRef}
            value={form.name}
            onChange={(e) =>
              setForm((p) => ({ ...p, name: e.target.value }))
            }
            bg={inputBg}
            borderColor={borderColor}
            borderRadius="xl"
          />
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>

        {/* CATEGORY + PRICE */}
        <HStack spacing={4} align="start">
          <FormControl isInvalid={!!errors.category}>
            <FormLabel>Danh mục</FormLabel>
            <Select
              ref={categoryRef}
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({ ...p, category: e.target.value }))
              }
              bg={inputBg}
              borderColor={borderColor}
              borderRadius="xl"
            >
              <option value="">Chọn danh mục</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{errors.category}</FormErrorMessage>
            {!!form.category && (
              <Text fontSize="xs" mt={1}>
                Đang chọn: <b>{selectedCategoryLabel}</b>
              </Text>
            )}
          </FormControl>

          <FormControl isInvalid={!!errors.price}>
            <FormLabel>Giá</FormLabel>
            <Input
              ref={priceRef}
              value={form.price}
              onChange={(e) =>
                setForm((p) => ({ ...p, price: e.target.value }))
              }
              inputMode="decimal"
              bg={inputBg}
              borderColor={borderColor}
              borderRadius="xl"
            />
            <FormErrorMessage>{errors.price}</FormErrorMessage>
          </FormControl>
        </HStack>

        {/* STOCK / SOLD / RATING */}
        <HStack spacing={4}>
          <FormControl isInvalid={!!errors.stock}>
            <FormLabel>Tồn kho</FormLabel>
            <Input
              ref={stockRef}
              value={form.stock}
              onChange={(e) =>
                setForm((p) => ({ ...p, stock: e.target.value }))
              }
              inputMode="numeric"
            />
            <FormErrorMessage>{errors.stock}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.sold}>
            <FormLabel>Đã bán</FormLabel>
            <Input
              ref={soldRef}
              value={form.sold}
               isReadOnly
              // onChange={(e) =>
              //   setForm((p) => ({ ...p, sold: e.target.value }))
              // }
              inputMode="numeric"
            />
            <FormErrorMessage>{errors.sold}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.rating}>
            <FormLabel>Đánh giá</FormLabel>
            <Input
              ref={ratingRef}
              value={form.rating}
              onChange={(e) =>
                setForm((p) => ({ ...p, rating: e.target.value }))
              }
              inputMode="decimal"
            />
            <FormErrorMessage>{errors.rating}</FormErrorMessage>
          </FormControl>
        </HStack>

        {/* FEATURE */}
        <HStack spacing={6}>
          <FormControl display="flex" alignItems="center" w="auto">
            <FormLabel mb="0">Nổi bật</FormLabel>
            <Switch
              isChecked={form.isFeatured}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  isFeatured: e.target.checked,
                  featuredRank: e.target.checked ? p.featuredRank || "1" : "",
                }))
              }
            />
          </FormControl>

          <FormControl
            isDisabled={!form.isFeatured}
            isInvalid={!!errors.featuredRank}
          >
            <FormLabel>Thứ hạng</FormLabel>
            <Input
              ref={rankRef}
              value={form.featuredRank}
              onChange={(e) =>
                setForm((p) => ({ ...p, featuredRank: e.target.value }))
              }
              inputMode="numeric"
            />
            <FormErrorMessage>{errors.featuredRank}</FormErrorMessage>
          </FormControl>
        </HStack>




        {/* DESCRIPTION */}
<FormControl isInvalid={!!errors.description}>
  <FormLabel>Mô tả</FormLabel>
  <Textarea
    value={form.description}
    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
    bg={inputBg}
    borderColor={borderColor}
    borderRadius="xl"
    rows={5}
    placeholder="Nhập mô tả sản phẩm..."
  />
  <FormErrorMessage>{errors.description}</FormErrorMessage>
</FormControl>


        {/* IMAGES */}
        <FormControl isInvalid={!!errors.images}>
          <FormLabel>Ảnh sản phẩm</FormLabel>
          <ImageUploader
            images={images}
            setImages={setImages}
            uploadFn={(file) =>
              uploadToCloudinarySigned(file, {
                type: "product",
                productId: product?._id,
              })
            }
          />
          <FormErrorMessage>{errors.images}</FormErrorMessage>
        </FormControl>

        {/* ACTION */}
        <HStack justify="flex-end">
          <Button variant="ghost" onClick={onCancel}>
            Huỷ
          </Button>
          <Button
            type="submit"
            colorScheme="vrv"
            isLoading={isSubmitting}
          >
            {product ? "Cập nhật" : "Tạo mới"}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
