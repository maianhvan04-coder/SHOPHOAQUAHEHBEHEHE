import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  HStack,
  FormErrorMessage,
  useToast,
  Select,
  NumberInput,
  NumberInputField,
  Checkbox,
} from "@chakra-ui/react";

const ROLE_TYPES = ["owner", "manager", "staff", "shipper", "user"];

function RoleForm({ role, onSubmit, onCancel }) {
  const toast = useToast();

  const [formData, setFormData] = useState({
    code: role?.code || "",
    name: role?.name || "",
    description: role?.description || "",
    type: role?.type || "user",
    priority: typeof role?.priority === "number" ? role.priority : 0,
    isActive: role?.isActive ?? true,
  });

  const [errors, setErrors] = useState({});

  // nếu mở modal edit role khác
  useEffect(() => {
    setFormData({
      code: role?.code || "",
      name: role?.name || "",
      description: role?.description || "",
      type: role?.type || "user",
      priority: typeof role?.priority === "number" ? role.priority : 0,
      isActive: role?.isActive ?? true,
    });
    setErrors({});
  }, [role]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) newErrors.code = "Role code is required";
    // gợi ý format
    if (formData.code && !/^[A-Z0-9_]+$/.test(formData.code.trim().toUpperCase())) {
      newErrors.code = "Code chỉ nên gồm A-Z, 0-9, _ (VD: ADMIN, STAFF_SALES)";
    }

    if (!formData.name.trim()) newErrors.name = "Role name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!ROLE_TYPES.includes(formData.type)) newErrors.type = "Type không hợp lệ";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const v = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: v }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors",
        status: "error",
        duration: 3000,
      });
      return;
    }

    // chuẩn hoá payload trước khi gửi backend
    const payload = {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      type: formData.type,
      priority: Number(formData.priority) || 0,
      isActive: !!formData.isActive,
    };

    onSubmit(payload);
  };

  const isEdit = !!role?._id || !!role?.id;

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.code} isRequired>
          <FormLabel>Role Code</FormLabel>
          <Input
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="VD: ADMIN, MANAGER, STAFF_SALES"
            isDisabled={isEdit} // edit thì thường không cho đổi code
          />
          <FormErrorMessage>{errors.code}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.name} isRequired>
          <FormLabel>Role Name</FormLabel>
          <Input name="name" value={formData.name} onChange={handleChange} placeholder="VD: Quản trị viên" />
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.description} isRequired>
          <FormLabel>Description</FormLabel>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Mô tả role..."
            rows={3}
          />
          <FormErrorMessage>{errors.description}</FormErrorMessage>
        </FormControl>

        <HStack spacing={4}>
          <FormControl isInvalid={!!errors.type} isRequired>
            <FormLabel>Type</FormLabel>
            <Select name="type" value={formData.type} onChange={handleChange}>
              {ROLE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{errors.type}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel>Priority</FormLabel>
            <NumberInput
              value={formData.priority}
              onChange={(_, v) => setFormData((p) => ({ ...p, priority: Number.isFinite(v) ? v : 0 }))}
              min={0}
            >
              <NumberInputField name="priority" />
            </NumberInput>
          </FormControl>
        </HStack>

        <FormControl>
          <Checkbox name="isActive" isChecked={formData.isActive} onChange={handleChange}>
            Active
          </Checkbox>
        </FormControl>

        <HStack spacing={3} justify="flex-end" pt={2}>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" colorScheme="vrv">
            {isEdit ? "Update" : "Create"} Role
          </Button>
        </HStack>
      </VStack>
    </form>
  );
}

RoleForm.propTypes = {
  role: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    code: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    type: PropTypes.string,
    priority: PropTypes.number,
    isActive: PropTypes.bool,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default RoleForm;
