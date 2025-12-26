/* eslint-disable react/prop-types */
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
import { rbacService } from "~/features/rbac/services/rbacService";

function UserForm({ user, onSubmit, onCancel }) {
  const toast = useToast();

  const isEdit = !!user?._id;

  const [roles, setRoles] = useState([]);

  const initialRoleCode = useMemo(() => {
    // backend user.roles: [{code,...}]
    const codes = (user?.roles || []).map((r) => r?.code).filter(Boolean);
    return codes?.[0] || ""; // pick first
  }, [user]);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    roleCode: initialRoleCode, // single role UI
    isActive: user?.isActive === false ? "false" : "true",
    password: "", // create required, edit optional
  });

  const [errors, setErrors] = useState({});

  // load roles from RBAC
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roleList = await rbacService.getRoles(); // should return [{_id,code,name,isActive,...}]
        const active = (roleList || []).filter((r) => r?.isActive !== false);

        setRoles(active);

        // set default role if create and none selected
        if (!isEdit && !formData.roleCode && active.length) {
          // avoid ADMIN default
          const firstNonAdmin = active.find((r) => r.code !== "ADMIN") || active[0];
          setFormData((p) => ({ ...p, roleCode: firstNonAdmin?.code || "" }));
        }

        // if edit and roleCode empty but user has roles
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

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    else if (formData.fullName.trim().length < 2) newErrors.fullName = "Min 2 characters";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email.trim())) newErrors.email = "Invalid email";

    // role code required, but disallow ADMIN via UI
    if (!formData.roleCode) newErrors.roleCode = "Please select a role";
    if (formData.roleCode === "ADMIN") newErrors.roleCode = "Không cho gán ADMIN qua UI";

    // password rules
    if (!isEdit) {
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 6) newErrors.password = "Min 6 characters";
    } else {
      // edit: optional
      if (formData.password && formData.password.length < 6) {
        newErrors.password = "Min 6 characters";
      }
    }

    // phone optional (validate digits only, length 10)
    if (formData.phone) {
      const digits = formData.phone.replace(/\D/g, "");
      if (digits.length !== 10) newErrors.phone = "Phone must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

    // build payload for backend
    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone ? formData.phone.replace(/\D/g, "") : "",
      isActive: formData.isActive === "true",
      roleCodes: formData.roleCode ? [formData.roleCode] : [],
    };

    // include password only when set
    if (!isEdit || formData.password) payload.password = formData.password;

    onSubmit?.(payload);
  };

  const handleChange = (e) => {
    const { name, value, isTrusted } = e.target;

    // phone: digits only + max 10
    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setFormData((p) => ({ ...p, phone: digits }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }

    if (isTrusted && errors[name]) {
      setErrors((p) => ({ ...p, [name]: undefined }));
    }
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
              .filter((r) => r.code !== "ADMIN") // ✅ chặn ADMIN trong UI
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
            <InputLeftAddon>+1</InputLeftAddon>
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
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" colorScheme="vrv">
            {isEdit ? "Update" : "Create"} User
          </Button>
        </HStack>
      </VStack>
    </form>
  );
}

export default UserForm;
