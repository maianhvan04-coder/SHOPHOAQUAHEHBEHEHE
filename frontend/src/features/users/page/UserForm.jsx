import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightElement,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { userService } from "~/features/users/userService";
import { validateUserForm } from "~/shared/utils/validators";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^0\d{9}$/;

function UserForm({ user, onSubmit, onCancel }) {
  const toast = useToast();
  const isEdit = !!user?._id;

  /* ================= THEME ================= */
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const labelColor = useColorModeValue("gray.600", "gray.400");

  /* ================= STATE ================= */
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone ? String(user.phone).replace(/^84/, "0") : "",
    roleCodes: user?.roles?.map((r) => r.code) || [],
    isActive: user?.isActive !== false,
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initRole, setInitRole] = useState(false);

  /* ================= LOAD ROLES ================= */
  useEffect(() => {
    let mounted = true;

    const loadRoles = async () => {
      try {
        const list = await userService.getAssignableRoles();
        if (!mounted) return;

        const activeRoles = (list || []).filter((r) => r?.isActive !== false);
        setRoles(activeRoles);

        if (!isEdit && !initRole && formData.roleCodes.length === 0 && activeRoles.length) {
          const defaults = activeRoles
            .filter((r) => r.code !== "ADMIN")
            .slice(0, 1)
            .map((r) => r.code);

          setFormData((p) => ({ ...p, roleCodes: defaults }));
          setInitRole(true);
        }
      } catch {
        toast({ status: "error", title: "Không tải được danh sách vai trò" });
      }
    };

    loadRoles();
    return () => (mounted = false);
  }, [isEdit, initRole, formData.roleCodes.length, toast]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((p) => ({ ...p, [name]: val }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: newErrors } = validateUserForm(formData, { isEdit });
    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        isActive: formData.isActive,
        roleCodes: formData.roleCodes,
      };
      if (formData.phone) payload.phone = formData.phone;
      if (formData.password) payload.password = formData.password;
      await onSubmit?.(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= UI ================= */
  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      bg={bgColor}
      p={6}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <VStack spacing={6} align="stretch">
        {/* HEADER */}
        <Text fontSize="lg" fontWeight="bold" color="blue.500">
          Thông tin người dùng
        </Text>

        {/* BASIC INFO */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacingX={8} spacingY={5}>
          <FormControl isInvalid={!!errors.fullName} isRequired>
            <FormLabel fontSize="xs" fontWeight="bold" color={labelColor}>
              Họ và tên
            </FormLabel>
            <Input name="fullName" value={formData.fullName} onChange={handleChange} />
            <FormErrorMessage>{errors.fullName}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.email} isRequired>
            <FormLabel fontSize="xs" fontWeight="bold" color={labelColor}>
              Email
            </FormLabel>
            <Input name="email" value={formData.email} onChange={handleChange} />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>
        </SimpleGrid>

        <Divider />

        {/* ===== VAI TRÒ (HÀNG 1) ===== */}
        <FormControl isInvalid={!!errors.roleCodes}>
          <FormLabel fontSize="xs" fontWeight="bold" color={labelColor} mb={3}>
            Vai trò hệ thống
          </FormLabel>

          <CheckboxGroup
            value={formData.roleCodes}
            onChange={(vals) => {
              setFormData((p) => ({ ...p, roleCodes: vals }));
              setErrors((p) => ({ ...p, roleCodes: undefined }));
            }}
          >
            <SimpleGrid columns={2} spacing={4}>
              {roles
                .filter((r) => r.code !== "ADMIN")
                .map((r) => {
                  const checked = formData.roleCodes.includes(r.code);
                  return (
                    <Box
                      key={r.code}
                      p={3}
                      border="1px solid"
                      borderColor={checked ? "blue.300" : borderColor}
                      bg={checked ? "blue.50" : "transparent"}
                      borderRadius="lg"
                    >
                      <Checkbox value={r.code} colorScheme="blue">
                        <Text fontWeight="bold">{r.name || r.code}</Text>
                      </Checkbox>
                    </Box>
                  );
                })}
            </SimpleGrid>
          </CheckboxGroup>

          <FormErrorMessage>{errors.roleCodes}</FormErrorMessage>
        </FormControl>

        {/* ===== TRẠNG THÁI (HÀNG 2) ===== */}
        <FormControl>
          <FormLabel fontSize="xs" fontWeight="bold" color={labelColor}>
            Trạng thái tài khoản
          </FormLabel>

          <HStack
            p={4}
            bg={formData.isActive ? "green.50" : "red.50"}
            borderRadius="lg"
            justify="space-between"
            border="1px solid"
            borderColor={formData.isActive ? "green.200" : "red.200"}
          >
            <Text fontWeight="bold">
              {formData.isActive ? "Tài khoản đang hoạt động" : "Tài khoản bị khóa"}
            </Text>
            <Switch
              name="isActive"
              isChecked={formData.isActive}
              onChange={handleChange}
              colorScheme="green"
            />
          </HStack>
        </FormControl>

        {/* ACTIONS */}
        <HStack justify="flex-end" pt={4}>
          <Button variant="ghost" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
            {isEdit ? "Cập nhật" : "Tạo người dùng"}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

export default UserForm;
