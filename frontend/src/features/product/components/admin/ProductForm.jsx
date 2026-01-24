/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  VStack,
  FormErrorMessage,
  useColorModeValue,
  Heading,
  Divider,
  Text,
  Badge,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Icon,
  Fade,
  ScaleFade,
  useToast,
} from "@chakra-ui/react";
import {
  EyeIcon,
  CurrencyDollarIcon,
  CubeIcon,
  TagIcon,
  PhotoIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

import ImageUploader from "~/features/upload/ImageUploader";
import { uploadToCloudinarySigned } from "~/features/upload/cloudinaryUpload";
import DescriptionEditor from "~/components/DescriptionEditor/DescriptionEditor";

/* helpers */
const isNonEmptyString = (s) => typeof s === "string" && s.trim();
const toNum = (v) => (v === "" ? NaN : Number(v));

export default function ProductForm({
  product,
  categories = [],
  onSubmit,
  onCancel,
  isSubmitting,
}) {
  const bg = useColorModeValue("white", "gray.900");
  const sectionBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.750");
  const labelColor = useColorModeValue("gray.700", "gray.300");
  const iconColor = useColorModeValue("gray.400", "gray.500");

  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
  });

  const [images, setImages] = useState([]);
  const [description, setDescription] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /* ===== EDIT MODE ===== */
  useEffect(() => {
    if (!product) return;

    setForm({
      name: product.name || "",
      category: product.category?._id || product.category || "",
      price: String(product.price ?? ""),
      stock: String(product.inventory.stock ?? ""),
    });

    setImages(product.images || []);
    setDescription(product.description || null);
  }, [product]);

  /* ===== VALIDATE ===== */
  const validate = () => {
    const e = {};
    if (!isNonEmptyString(form.name)) e.name = "Nhập tên sản phẩm";
    if (!isNonEmptyString(form.category)) e.category = "Chọn danh mục";
    if (!Number.isFinite(toNum(form.price)) || toNum(form.price) < 0)
      e.price = "Giá không hợp lệ";
    if (!Number.isFinite(toNum(form.stock)) || toNum(form.stock) < 0)
      e.stock = "Tồn kho không hợp lệ";
    if (!images.length) e.images = "Cần ít nhất 1 ảnh";
    if (!description?.templateType)
      e.description = "Chưa chọn mẫu mô tả";
    return e;
  };

  /* ===== REALTIME VALIDATION ===== */
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      setErrors(validate());
    }
  }, [form, images, description, touched]);

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  /* ===== SUBMIT ===== */
  const submit = (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    setTouched({
      name: true,
      category: true,
      price: true,
      stock: true,
      images: true,
      description: true,
    });

    if (Object.keys(next).length) {
      toast({
        title: "Vui lòng kiểm tra lại form",
        description: "Có một số trường chưa hợp lệ",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onSubmit?.({
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      inventory: { stock: Number(form.stock) },
      images,
      description,
    });
  };

  const formatCurrency = (value) => {
    if (!value) return "";
    return Number(value).toLocaleString("vi-VN");
  };

  const isFormValid = Object.keys(validate()).length === 0;

  return (
    <Box as="form" onSubmit={submit}>
      <VStack spacing={6} align="stretch">
        {/* ================= PROGRESS INDICATOR ================= */}
        <Box bg={sectionBg} p={4} borderRadius="xl" border="1px solid" borderColor={borderColor}>
          <HStack spacing={4} justify="space-between">
            <HStack spacing={3}>
              <Badge colorScheme={form.name && !errors.name ? "green" : "gray"} fontSize="sm" px={3} py={1} borderRadius="full">
                Thông tin
              </Badge>
              <Badge colorScheme={description?.templateType && !errors.description ? "green" : "gray"} fontSize="sm" px={3} py={1} borderRadius="full">
                Mô tả
              </Badge>
              <Badge colorScheme={images.length > 0 && !errors.images ? "green" : "gray"} fontSize="sm" px={3} py={1} borderRadius="full">
                Hình ảnh
              </Badge>
                    <Button
                size="sm"
                variant="outline"
                colorScheme="purple"
                leftIcon={<EyeIcon className="h-4 w-4" />}
                isDisabled={!description?.templateType}
                onClick={() =>
                  navigate("/admin/product/preview", {
                    state: {
                      product: {
                        name: form.name,
                        price: Number(form.price),
                        images,
                        description,
                      },
                    },
                  })
                }
                _hover={{ transform: "translateY(-2px)", shadow: "md" }}
                transition="all 0.2s"
              >
                Xem trước
              </Button>
            </HStack>
            <Text fontSize="sm" color={labelColor} fontWeight="medium">
              {isFormValid ? "✓ Hoàn tất" : `${Object.keys(errors).length} lỗi`}
            </Text>
          </HStack>
        </Box>

        {/* ================= BASIC INFO ================= */}
        <ScaleFade in={true} initialScale={0.95}>
          <Box 
            bg={sectionBg} 
            p={6} 
            borderRadius="xl" 
            border="1px solid" 
            borderColor={borderColor}
            shadow="sm"
            _hover={{ shadow: "md" }}
            transition="all 0.3s"
          >
            <HStack mb={5}>
              <Icon as={TagIcon} w={5} h={5} color="blue.500" />
              <Heading size="md" color={labelColor}>Thông tin cơ bản</Heading>
            </HStack>

            <VStack spacing={5} align="stretch">
              <FormControl isInvalid={touched.name && !!errors.name}>
                <FormLabel color={labelColor} fontWeight="semibold" fontSize="sm">
                  Tên sản phẩm
                  <Text as="span" color="red.500" ml={1}>*</Text>
                </FormLabel>
                <Input
                  bg={bg}
                  size="lg"
                  value={form.name}
                  placeholder="VD: Táo"
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  onBlur={() => handleBlur('name')}
                  borderColor={touched.name && errors.name ? "red.300" : borderColor}
                  _hover={{ borderColor: "blue.300" }}
                  _focus={{ borderColor: "blue.500", shadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                  transition="all 0.2s"
                />
                <FormErrorMessage fontSize="sm">{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={touched.category && !!errors.category}>
                <FormLabel color={labelColor} fontWeight="semibold" fontSize="sm">
                  Danh mục
                  <Text as="span" color="red.500" ml={1}>*</Text>
                </FormLabel>
                <Select
                  bg={bg}
                  size="lg"
                  value={form.category}
                  placeholder="Chọn danh mục sản phẩm"
                  onChange={(e) =>
                    setForm((p) => ({ ...p, category: e.target.value }))
                  }
                  onBlur={() => handleBlur('category')}
                  borderColor={touched.category && errors.category ? "red.300" : borderColor}
                  _hover={{ borderColor: "blue.300" }}
                  _focus={{ borderColor: "blue.500", shadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                  transition="all 0.2s"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage fontSize="sm">{errors.category}</FormErrorMessage>
              </FormControl>

              <HStack spacing={4} align="flex-start">
                <FormControl isInvalid={touched.price && !!errors.price} flex={1}>
                  <FormLabel color={labelColor} fontWeight="semibold" fontSize="sm">
                    Giá bán
                    <Text as="span" color="red.500" ml={1}>*</Text>
                  </FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={CurrencyDollarIcon} color={iconColor} w={5} h={5} />
                    </InputLeftElement>
                    <Input
                      bg={bg}
                      value={form.price}
                      placeholder="0"
                      onChange={(e) =>
                        setForm((p) => ({ ...p, price: e.target.value }))
                      }
                      onBlur={() => handleBlur('price')}
                      borderColor={touched.price && errors.price ? "red.300" : borderColor}
                      _hover={{ borderColor: "blue.300" }}
                      _focus={{ borderColor: "blue.500", shadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                      transition="all 0.2s"
                    />
                    <InputRightElement width="auto" px={3}>
                      <Text fontSize="sm" color={labelColor} fontWeight="medium">
                        VNĐ
                      </Text>
                    </InputRightElement>
                  </InputGroup>
                  {!errors.price && form.price && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      ≈ {formatCurrency(form.price)} VNĐ
                    </Text>
                  )}
                  <FormErrorMessage fontSize="sm">{errors.price}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={touched.stock && !!errors.stock} flex={1}>
                  <FormLabel color={labelColor} fontWeight="semibold" fontSize="sm">
                    Tồn kho
                    <Text as="span" color="red.500" ml={1}>*</Text>
                  </FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={CubeIcon} color={iconColor} w={5} h={5} />
                    </InputLeftElement>
                    <Input
                      bg={bg}
                      value={form.stock}
                      placeholder="0"
                      onChange={(e) =>
                        setForm((p) => ({ ...p, stock: e.target.value }))
                      }
                      onBlur={() => handleBlur('stock')}
                      borderColor={touched.stock && errors.stock ? "red.300" : borderColor}
                      _hover={{ borderColor: "blue.300" }}
                      _focus={{ borderColor: "blue.500", shadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                      transition="all 0.2s"
                    />
                    <InputRightElement width="auto" px={3}>
                      <Text fontSize="sm" color={labelColor} fontWeight="medium">
                        Sản phẩm
                      </Text>
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage fontSize="sm">{errors.stock}</FormErrorMessage>
                </FormControl>
              </HStack>
            </VStack>
          </Box>
        </ScaleFade>

        {/* ================= DESCRIPTION ================= */}
        <ScaleFade in={true} initialScale={0.95} delay={0.1}>
          <Box 
            bg={sectionBg} 
            p={6} 
            borderRadius="xl" 
            border="1px solid" 
            borderColor={borderColor}
            shadow="sm"
            _hover={{ shadow: "md" }}
            transition="all 0.3s"
          >
            <HStack justify="space-between" mb={4}>
              <HStack>
                <Icon as={DocumentTextIcon} w={5} h={5} color="purple.500" />
                <Heading size="md" color={labelColor}>Mô tả sản phẩm</Heading>
              </HStack>

        
            </HStack>

            <Divider mb={5} />

            <FormControl isInvalid={touched.description && !!errors.description}>
              <DescriptionEditor
                value={description}
                onChange={(val) => {
                  setDescription(val);
                  setTouched(prev => ({ ...prev, description: true }));
                }}
              />
              <FormErrorMessage fontSize="sm">{errors.description}</FormErrorMessage>
            </FormControl>
          </Box>
        </ScaleFade>

        {/* ================= IMAGES ================= */}
        <ScaleFade in={true} initialScale={0.95} delay={0.2}>
          <Box 
            bg={sectionBg} 
            p={6} 
            borderRadius="xl" 
            border="1px solid" 
            borderColor={borderColor}
            shadow="sm"
            _hover={{ shadow: "md" }}
            transition="all 0.3s"
          >
            <HStack mb={5}>
              <Icon as={PhotoIcon} w={5} h={5} color="green.500" />
              <Heading size="md" color={labelColor}>Hình ảnh sản phẩm</Heading>
              {images.length > 0 && (
                <Badge colorScheme="green" borderRadius="full" px={2}>
                  {images.length} ảnh
                </Badge>
              )}
            </HStack>

            <FormControl isInvalid={touched.images && !!errors.images}>
              <ImageUploader
                images={images}
                setImages={(newImages) => {
                  setImages(newImages);
                  setTouched(prev => ({ ...prev, images: true }));
                }}
                uploadFn={(file) =>
                  uploadToCloudinarySigned(file, { type: "product" })
                }
              />
              <FormErrorMessage fontSize="sm">{errors.images}</FormErrorMessage>
            </FormControl>
          </Box>
        </ScaleFade>

        {/* ================= ACTION ================= */}
        <Fade in={true}>
          <Box 
            position="sticky" 
            bottom={0} 
            bg={sectionBg} 
            p={5} 
            borderRadius="xl" 
            border="1px solid" 
            borderColor={borderColor}
            shadow="lg"
          >
            <HStack justify="space-between" spacing={4}>
              <Text fontSize="sm" color={labelColor}>
                {product ? "Cập nhật thông tin sản phẩm" : "Tạo sản phẩm mới"}
              </Text>
              <HStack spacing={3}>
                <Button 
                  variant="ghost" 
                  onClick={onCancel}
                  size="lg"
                  _hover={{ bg: hoverBg }}
                >
                  Huỷ
                </Button>
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={isSubmitting}
                  size="lg"
                  px={8}
                  _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                  transition="all 0.2s"
                  isDisabled={!isFormValid}
                >
                  {product ? "💾 Cập nhật" : "✨ Tạo mới"}
                </Button>
              </HStack>
            </HStack>
          </Box>
        </Fade>
      </VStack>
    </Box>
  );
}