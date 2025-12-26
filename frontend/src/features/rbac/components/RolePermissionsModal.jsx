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
  initialSelectedKeys = [], // ✅ thêm prop
}) {
  const [selected, setSelected] = useState([]);

  // ✅ mở modal là set selected theo permissionKeys hiện tại của role
  useEffect(() => {
    if (!isOpen) return;
    setSelected(Array.isArray(initialSelectedKeys) ? initialSelectedKeys : []);
  }, [isOpen, initialSelectedKeys]);

  const permsByGroup = useMemo(() => {
    const map = {};
    (allPermissions || [])
      .filter((p) => p?.isActive !== false)
      .forEach((p) => {
        const g = p.group || "OTHER";
        map[g] = map[g] || [];
        map[g].push(p);
      });

    Object.keys(map).forEach((g) => {
      map[g].sort((a, b) => (a.key || "").localeCompare(b.key || ""));
    });
    return map;
  }, [allPermissions]);

  const toggle = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const selectAllGroup = (group) => {
    const keys = (permsByGroup[group] || []).map((p) => p.key).filter(Boolean);
    setSelected((prev) => Array.from(new Set([...prev, ...keys])));
  };

  const clearAllGroup = (group) => {
    const keys = new Set((permsByGroup[group] || []).map((p) => p.key));
    setSelected((prev) => prev.filter((k) => !keys.has(k)));
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
            <Heading size="md">Gán permissions</Heading>
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
          <Stack spacing={5}>
            {Object.keys(permsByGroup).length === 0 ? (
              <Text>Không có permission nào.</Text>
            ) : (
              Object.entries(permsByGroup).map(([group, list]) => (
                <Box key={group} borderWidth="1px" rounded="lg" p={4}>
                  <Flex justify="space-between" align="center">
                    <Heading size="sm">{group}</Heading>
                    <HStack>
                      <Button size="xs" variant="outline" onClick={() => selectAllGroup(group)}>
                        Select all
                      </Button>
                      <Button size="xs" variant="outline" onClick={() => clearAllGroup(group)}>
                        Clear
                      </Button>
                    </HStack>
                  </Flex>

                  <Divider my={3} />

                  <Stack spacing={2}>
                    {list.map((p) => (
                      <Checkbox
                        key={p._id || p.key}
                        isChecked={selected.includes(p.key)}
                        onChange={() => toggle(p.key)}
                      >
                        <HStack spacing={3}>
                          <Text fontWeight="medium">{p.key}</Text>
                          <Text fontSize="sm" opacity={0.7}>
                            {p.name}
                          </Text>
                        </HStack>
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
            <Button colorScheme="vrv" onClick={onSubmit} isLoading={saving} isDisabled={!role}>
              Save ({selected.length})
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
