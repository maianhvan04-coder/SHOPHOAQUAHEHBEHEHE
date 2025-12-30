import { useEffect, useMemo, useState } from "react";
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
  Text,
} from "@chakra-ui/react";
import { userService } from "~/features/users/userService";
function UserForm({ user, onSubmit, onCancel }) {
  const toast = useToast();
  const isEdit = !!user?._id;


  const includeRoleCodes = true;

  const [roles, setRoles] = useState([]);

  const initialRoleCode = useMemo(() => {
    const codes = (user?.roles || []).map((r) => r?.code).filter(Boolean);
    return codes?.[0] || "";
  }, [user]);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    roleCode: initialRoleCode,
    isActive: user?.isActive === false ? "false" : "true",
    password: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roleList = await userService.getAssignableRoles();
        console.log("Roles List",roleList)
        const active = (roleList || []).filter((r) => r?.isActive !== false);
        setRoles(active);

        // default role for create
        if (!isEdit && !formData.roleCode && active.length) {
          const firstNonAdmin = active.find((r) => r.code !== "ADMIN") || active[0];
          setFormData((p) => ({ ...p, roleCode: firstNonAdmin?.code || "" }));
        }

        // edit: fill from user if empty
        if (isEdit && !formData.roleCode && initialRoleCode) {
          setFormData((p) => ({ ...p, roleCode: initialRoleCode }));
        }
      } catch (error) {
        toast({
          title: "Error loading roles",
          description: error?.message || "Không load được roles",
          status: "error",
          duration: 3000,
        });
      }
    };

    loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateForm = () => {
    const newErrors = {};

    const fullName = String(formData.fullName || "").trim();
    const email = String(formData.email || "").trim();
    const phoneDigits = formData.phone ? String(formData.phone).replace(/\D/g, "") : "";

    if (!fullName) newErrors.fullName = "Full name is required";
    else if (fullName.length < 2) newErrors.fullName = "Min 2 characters";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) newErrors.email = "Email is required";
    else if (!emailRegex.test(email)) newErrors.email = "Invalid email";

    // role required (UI), and block ADMIN
    if (!formData.roleCode) newErrors.roleCode = "Please select a role";
    if (formData.roleCode === "ADMIN") newErrors.roleCode = "Không cho gán ADMIN qua UI";

    // password rules
    if (!isEdit) {
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 6) newErrors.password = "Min 6 characters";
    } else {
      if (formData.password && formData.password.length < 6) {
        newErrors.password = "Min 6 characters";
      }
    }

    // phone optional: nếu nhập thì phải đủ 10 số
    if (phoneDigits && phoneDigits.length !== 10) {
      newErrors.phone = "Phone must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => {
    const fullName = String(formData.fullName || "").trim();
    const email = String(formData.email || "").trim().toLowerCase();

    const phoneDigits = formData.phone ? String(formData.phone).replace(/\D/g, "").slice(0, 10) : "";

    const payload = {
      fullName,
      email,
      isActive: formData.isActive === "true",
    };

    if (phoneDigits) payload.phone = phoneDigits;

    if (includeRoleCodes) {
      payload.roleCodes = formData.roleCode ? [formData.roleCode] : [];
    }

    if (!isEdit || formData.password) payload.password = String(formData.password);

    return payload;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Form Validation Error",
        description: "Please check the form for errors",
        status: "error",
        duration: 2500,
      });
      return;
    }

    onSubmit?.(buildPayload());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setFormData((p) => ({ ...p, phone: digits }));
    } else if (name === "email") {
      setFormData((p) => ({ ...p, email: value.trimStart() })); // tránh space đầu
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }

    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isInvalid={!!errors.fullName} isRequired>
          <FormLabel>Full Name</FormLabel>
          <Input
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter full name"
            onBlur={validateForm}
          />
          <FormErrorMessage>{errors.fullName}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.email} isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
            onBlur={validateForm}
          />
          <FormErrorMessage>{errors.email}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.roleCode} isRequired>
          <FormLabel>Role</FormLabel>
          <Select name="roleCode" value={formData.roleCode} onChange={handleChange}>
            <option value="">Select Role</option>
            {roles
              .filter((r) => r.code !== "ADMIN")
              .map((r) => (
                <option key={r._id || r.code} value={r.code}>
                  {r.code} {r.name ? `- ${r.name}` : ""}
                </option>
              ))}
          </Select>
          <FormErrorMessage>{errors.roleCode}</FormErrorMessage>
          <Text fontSize="xs" opacity={0.7} mt={1}>
            ADMIN không cho gán từ UI (chỉ chỉnh trong DB).
          </Text>
        </FormControl>

        <FormControl isInvalid={!!errors.phone}>
          <FormLabel>Phone Number</FormLabel>
          <InputGroup>
            {/* ✅ nếu bạn VN thì +84; hoặc bỏ addon luôn */}
            <InputLeftAddon>+84</InputLeftAddon>
            <Input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10-digit number"
              maxLength={10}
            />
          </InputGroup>
          <FormErrorMessage>{errors.phone}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.password} isRequired={!isEdit}>
          <FormLabel>Password {isEdit ? "(optional)" : ""}</FormLabel>
          <Input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={isEdit ? "Leave blank to keep current password" : "Enter password"}
            onBlur={validateForm}
          />
          <FormErrorMessage>{errors.password}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>Status</FormLabel>
          <Select name="isActive" value={formData.isActive} onChange={handleChange}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
        </FormControl>

        <HStack spacing={3} width="full" justify="flex-end" pt={4}>
          <Button variant="outline" onClick={onCancel} fontWeight="normal">
            Cancel
          </Button>
          <Button type="submit" colorScheme="vrv" fontWeight="normal">
            {isEdit ? "Update" : "Create"} User
          </Button>
        </HStack>
      </VStack>
    </form>
  );
}

export default UserForm;
