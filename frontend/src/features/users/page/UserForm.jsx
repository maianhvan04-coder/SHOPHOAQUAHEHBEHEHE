import { useEffect, useState } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
  FormErrorMessage,
  useToast,
  HStack,
  InputGroup,
  InputLeftAddon,
  InputRightElement,
  IconButton,
  Text,
  SimpleGrid,
  Box,
  Switch,
  Divider,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { userService } from "~/features/users/userService";
import { validateUserForm } from "~/shared/utils/validators";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; 
const PHONE_REGEX = /^0\d{9}$/;
function UserForm({ user, onSubmit, onCancel }) {
  const toast = useToast();
  const isEdit = !!user?._id;
const validate = () => {
  const { isValid, errors: newErrors } = validateUserForm(formData, { isEdit });
  setErrors(newErrors);
  return isValid;
};
  /* ================= STATE ================= */
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone ? String(user.phone).replace(/^84/, "0") : "",
    roleCode: user?.roles?.[0]?.code || "",
    isActive: user?.isActive !== false,
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ================= LOAD ROLES ================= */
  useEffect(() => {
    let mounted = true;

    const loadRoles = async () => {
      try {
        const list = await userService.getAssignableRoles();
        if (!mounted) return;

        const activeRoles = (list || []).filter(r => r?.isActive !== false);
        setRoles(activeRoles);

        if (!isEdit && !formData.roleCode && activeRoles.length) {
          const defaultRole =
            activeRoles.find(r => r.code !== "ADMIN") || activeRoles[0];
          setFormData(p => ({ ...p, roleCode: defaultRole.code }));
        }
      } catch (err) {
        console.error("Load roles error", err);
      }
    };

    loadRoles();
    return () => { mounted = false; };
  }, [isEdit]);

  

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData(p => ({ ...p, [name]: val }));

    if (errors[name]) {
      setErrors(p => ({ ...p, [name]: undefined }));
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        isActive: formData.isActive,
        roleCodes: [formData.roleCode],
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
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={5} align="stretch">
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
          {/* FULL NAME */}
          <FormControl isInvalid={!!errors.fullName} isRequired>
            <FormLabel fontSize="sm">Họ và tên</FormLabel>
            <Input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
            />
            <FormErrorMessage>{errors.fullName}</FormErrorMessage>
          </FormControl>

          {/* EMAIL */}
          <FormControl isInvalid={!!errors.email} isRequired>
            <FormLabel fontSize="sm">Email</FormLabel>
            <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => {
                if (
                  formData.email &&
                  !EMAIL_REGEX.test(formData.email.trim())
                ) {
                  setErrors(p => ({
                    ...p,
                    email: "Email không đúng định dạng",
                  }));
                }
              }}
              placeholder="name@company.com"
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          {/* PHONE */}
          <FormControl isInvalid={!!errors.phone}>
            <FormLabel fontSize="sm">Số điện thoại</FormLabel>
            <InputGroup>
              <InputLeftAddon children="+84" />
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => {
                  if (
                    formData.phone &&
                    !PHONE_REGEX.test(formData.phone)
                  ) {
                    setErrors(p => ({
                      ...p,
                      phone: "Số điện thoại phải bắt đầu bằng 0 và đủ 10 số",
                    }));
                  }
                }}
                placeholder="0912345678"
                maxLength={10}
              />
            </InputGroup>
            <FormErrorMessage>{errors.phone}</FormErrorMessage>
          </FormControl>

          {/* ROLE */}
          <FormControl isInvalid={!!errors.roleCode} isRequired>
            <FormLabel fontSize="sm">Vai trò</FormLabel>
            <Select
              name="roleCode"
              value={formData.roleCode}
              onChange={handleChange}
              placeholder="Chọn vai trò"
            >
              {roles.filter(r => r.code !== "ADMIN").map(r => (
                <option key={r._id || r.code} value={r.code}>
                  {r.name || r.code}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{errors.roleCode}</FormErrorMessage>
          </FormControl>

          {/* PASSWORD */}
          <FormControl isInvalid={!!errors.password} isRequired={!isEdit}>
            <FormLabel fontSize="sm">
              Mật khẩu{" "}
              {isEdit && (
                <Text as="span" color="gray.500" fontWeight="normal">
                  (Để trống nếu không đổi)
                </Text>
              )}
            </FormLabel>
            <InputGroup>
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
              />
              <InputRightElement>
                <IconButton
                  size="sm"
                  variant="ghost"
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowPassword(p => !p)}
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>

          {/* ACTIVE */}
          <FormControl display="flex" alignItems="center" pt={8}>
            <FormLabel mb="0" fontSize="sm">
              Trạng thái hoạt động
            </FormLabel>
            <Switch
              name="isActive"
              colorScheme="green"
              isChecked={formData.isActive}
              onChange={handleChange}
            />
          </FormControl>
        </SimpleGrid>

        <Divider pt={4} />

        <HStack justify="flex-end">
          <Button variant="ghost" onClick={onCancel}>
            Hủy
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isSubmitting}
            px={8}
          >
            {isEdit ? "Lưu thay đổi" : "Tạo người dùng"}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

export default UserForm;
