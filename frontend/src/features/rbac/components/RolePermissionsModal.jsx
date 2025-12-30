/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Tag,
  TagLabel,
  Text,
} from "@chakra-ui/react";

export default function RolePermissionsModal({
  isOpen,
  onClose,
  role,
  allPermissions = [],
  onSave,
  saving = false,
  initialSelectedKeys = [],
}) {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    setSelected(Array.isArray(initialSelectedKeys) ? initialSelectedKeys : []);
  }, [isOpen, initialSelectedKeys]);

  // ✅ group theo groupKey/groupLabel, sort theo order
  const groups = useMemo(() => {
    const map = new Map();

    (allPermissions || [])
      .filter((p) => p?.isActive !== false)
      .forEach((p) => {
        const groupKey = p.groupKey || p.group || "OTHER";
        const groupLabel = p.groupLabel || groupKey;

        if (!map.has(groupKey)) {
          map.set(groupKey, {
            groupKey,
            groupLabel,
            items: [],
          });
        }
        map.get(groupKey).items.push(p);
      });

    const arr = Array.from(map.values());

    // sort item theo order trước, fallback key
    arr.forEach((g) => {
      g.items.sort((a, b) => {
        const ao = a.order ?? 999999;
        const bo = b.order ?? 999999;
        if (ao !== bo) return ao - bo;
        return (a.key || "").localeCompare(b.key || "");
      });
    });

    // sort group theo groupKey (hoặc nếu bạn có group order thì gán vào DB rồi sort theo đó)
    arr.sort((a, b) => (a.groupKey || "").localeCompare(b.groupKey || ""));

    return arr;
  }, [allPermissions]);

  const toggle = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const isGroupAllSelected = (group) =>
    group.items.length > 0 && group.items.every((p) => selected.includes(p.key));

  const toggleGroupAll = (group) => {
    const keys = group.items.map((p) => p.key).filter(Boolean);

    setSelected((prev) => {
      const hasAll = keys.every((k) => prev.includes(k));
      if (hasAll) return prev.filter((k) => !keys.includes(k)); // clear group

      const set = new Set(prev);
      keys.forEach((k) => set.add(k));
      return Array.from(set);
    });
  };

  const onSubmit = async () => {
    await onSave?.(selected);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Heading size="md">Manage Permissions</Heading>
            <Tag colorScheme="vrv" variant="subtle">
              <TagLabel>{role?.code || role?.name || "ROLE"}</TagLabel>
            </Tag>
          </HStack>
          <Text fontSize="sm" opacity={0.7} mt={1}>
            Chọn permissions theo nhóm
          </Text>
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody>
          <Stack spacing={6}>
            {groups.length === 0 ? (
              <Text>Không có permission nào.</Text>
            ) : (
              groups.map((g) => (
                <Box key={g.groupKey} borderWidth="1px" rounded="lg" p={4}>
                  <Flex justify="space-between" align="center">
                    {/* ✅ giống ảnh: User Management / Role Management... */}
                    <Heading size="sm">{g.groupLabel}</Heading>

                    <Button
                      size="xs"
                      variant="link"
                      onClick={() => toggleGroupAll(g)}
                    >
                      {isGroupAllSelected(g) ? "Clear All" : "Select All"}
                    </Button>
                  </Flex>

                  <Divider my={3} />

                  <Stack spacing={2}>
                    {g.items.map((p) => (
                      <Checkbox
                        key={p._id || p.key}
                        isChecked={selected.includes(p.key)}
                        onChange={() => toggle(p.key)}
                      >
                        {/* ✅ giống ảnh: View Users / Create Users... */}
                        <Text fontWeight="500">{p.label || p.key}</Text>
                      </Checkbox>
                    ))}
                  </Stack>
                </Box>
              ))
            )}
          </Stack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="vrv"
              onClick={onSubmit}
              isLoading={saving}
              isDisabled={!role}
            >
              Save ({selected.length})
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
