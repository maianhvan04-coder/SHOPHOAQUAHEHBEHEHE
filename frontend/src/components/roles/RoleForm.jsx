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
  Checkbox,
} from "@chakra-ui/react";

const ROLE_TYPES = ["owner", "manager", "staff", "shipper", "user"];

function RoleForm({ role, onSubmit, onCancel }) {
  const toast = useToast();
  const isEdit = !!role?._id || !!role?.id;

  // ✅ priorityString: lưu string để gõ realtime
  const [formData, setFormData] = useState({
    code: role?.code || "",
    name: role?.name || "",
    description: role?.description || "",
    type: role?.type || "user",
    priority: role?.priority !== undefined && role?.priority !== null ? String(role.priority) : "0",
    isActive: role?.isActive ?? true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData({
      code: role?.code || "",
      name: role?.name || "",
      description: role?.description || "",
      type: role?.type || "user",
      priority: role?.priority !== undefined && role?.priority !== null ? String(role.priority) : "0",
      isActive: role?.isActive ?? true,
    });
    setErrors({});
  }, [role]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = "Role code không được để trống";
    } else if (!/^[A-Z0-9_]+$/.test(formData.code.trim().toUpperCase())) {
      newErrors.code = "Code chỉ gồm A-Z, 0-9 và dấu gạch dưới";
    }

    if (!formData.name.trim()) newErrors.name = "Tên role không được để trống";
    if (!formData.description.trim()) newErrors.description = "Mô tả không được để trống";
    if (!ROLE_TYPES.includes(formData.type)) newErrors.type = "Type không hợp lệ";

    // ⚠️ KHÔNG validate priority ở đây (theo yêu cầu: chỉ kiểm tra khi blur)
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // ✅ chỉ validate + normalize priority khi rời input
  const handlePriorityBlur = () => {
    const raw = String(formData.priority ?? "").trim();

    // cho phép rỗng khi đang gõ, blur thì ép về 0 (hoặc bạn muốn báo lỗi cũng được)
    if (raw === "") {
      setFormData((p) => ({ ...p, priority: "0" }));
      setErrors((prev) => ({ ...prev, priority: undefined }));
      return;
    }

    // chỉ cho digits
    if (!/^\d+$/.test(raw)) {
      setErrors((prev) => ({ ...prev, priority: "Priority chỉ được nhập số (0-999)" }));
      return;
    }

    // normalize: bỏ số 0 đầu (0007 -> 7)
    const num = Number(raw);
    if (!Number.isFinite(num)) {
      setErrors((prev) => ({ ...prev, priority: "Priority không hợp lệ" }));
      return;
    }

    if (num < 0 || num > 999) {
      setErrors((prev) => ({ ...prev, priority: "Priority phải trong khoảng 0 - 999" }));
      return;
    }

    setErrors((prev) => ({ ...prev, priority: undefined }));
    setFormData((p) => ({ ...p, priority: String(num) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // validate các field khác
    if (!validateForm()) {
      toast({
        title: "Thông báo",
        description: "Vui lòng kiểm tra lại thông tin nhập liệu",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // ✅ trước khi submit: convert priority string -> number an toàn
    const pr = String(formData.priority ?? "").trim();
    const priorityNum = /^\d+$/.test(pr) ? Number(pr) : 0;

    const payload = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      priority: Number.isFinite(priorityNum) ? priorityNum : 0,
      isActive: !!formData.isActive,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.code} isRequired>
          <FormLabel>Role Code</FormLabel>
          <Input
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="VD: ADMIN, SALES_STAFF"
            isDisabled={isEdit}
          />
          <FormErrorMessage>{errors.code}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.name} isRequired>
          <FormLabel>Role Name</FormLabel>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="VD: Quản trị viên hệ thống"
          />
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.description} isRequired>
          <FormLabel>Description</FormLabel>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Nhập mô tả chi tiết quyền hạn..."
            rows={3}
          />
          <FormErrorMessage>{errors.description}</FormErrorMessage>
        </FormControl>

        <HStack spacing={4} align="start">
          <FormControl isInvalid={!!errors.type} isRequired>
            <FormLabel>Type</FormLabel>
            <Select name="type" value={formData.type} onChange={handleChange}>
              {ROLE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.toUpperCase()}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{errors.type}</FormErrorMessage>
          </FormControl>

          {/* ✅ Priority = string input */}
          <FormControl isInvalid={!!errors.priority}>
            <FormLabel>Priority</FormLabel>
            <Input
              name="priority"
              value={formData.priority}
              onChange={(e) => {
                // cho gõ realtime: chỉ cập nhật string, không ép số ngay
                setFormData((p) => ({ ...p, priority: e.target.value }));
                if (errors.priority) setErrors((prev) => ({ ...prev, priority: undefined }));
              }}
              onBlur={handlePriorityBlur}
              placeholder="0 - 999"
              inputMode="numeric"
              autoComplete="off"
              onKeyDown={(e) => {
                // chặn e/E/+/- để khỏi nhập scientific notation
                if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
              }}
            />
            <FormErrorMessage>{errors.priority}</FormErrorMessage>
          </FormControl>
        </HStack>

        <FormControl mt={2}>
          <Checkbox
            name="isActive"
            isChecked={formData.isActive}
            onChange={handleChange}
            colorScheme="blue"
          >
            Kích hoạt (Active)
          </Checkbox>
        </FormControl>

        <HStack spacing={3} justify="flex-end" pt={4}>
          <Button variant="outline" onClick={onCancel} width="100px">
            Hủy
          </Button>
          <Button type="submit" colorScheme="blue" width="120px">
            {isEdit ? "Cập nhật" : "Tạo mới"}
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
    priority: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    isActive: PropTypes.bool,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default RoleForm;
