/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  Heading,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Tag,
  TagLabel,
  Text,
} from "@chakra-ui/react";

const SCOPES = [
  { value: "all", label: "All" },
  { value: "own", label: "Own" },
  { value: "department", label: "Department" },
  { value: "organization", label: "Organization" },
];

export default function RolePermissionsModal({
  isOpen,
  onClose,
  role,
  allPermissions = [],
  onSave,
  saving = false,
  /**
   * initialPermissions format:
   * [
   *   { key, scope, field }
   * ]
   */
  initialPermissions = [],
}) {
  /**
   * permissionsMap:
   * {
   *   [permissionKey]: { scope, field }
   * }
   */
  const [permissionsMap, setPermissionsMap] = useState({});

  // 🔐 tránh init lại nhiều lần → tránh infinite loop
  const initializedRef = useRef(false);

  // =====================
  // INIT ON OPEN (SAFE)
  // =====================
  useEffect(() => {
    if (!isOpen) {
      initializedRef.current = false;
      return;
    }

    if (initializedRef.current) return;

    const map = {};
    (initialPermissions || []).forEach((p) => {
      map[p.key] = {
        scope: p.scope || "all",
        field: p.field || null,
      };
    });

    setPermissionsMap(map);
    initializedRef.current = true;
  }, [isOpen, initialPermissions]);

  // =====================
  // GROUP PERMISSIONS
  // =====================
  const groups = useMemo(() => {
    const map = new Map();

    (allPermissions || [])
      .filter((p) => p?.isActive !== false)
      .forEach((p) => {
        const groupKey = p.groupKey || "OTHER";
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

    arr.forEach((g) => {
      g.items.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
    });

    return arr;
  }, [allPermissions]);

  // =====================
  // HANDLERS
  // =====================
  const togglePermission = (key, checked) => {
    setPermissionsMap((prev) => {
      const next = { ...prev };
      if (!checked) {
        delete next[key];
      } else {
        next[key] = { scope: "all", field: null };
      }
      return next;
    });
  };

  const updateScope = (key, scope) => {
    setPermissionsMap((prev) => ({
      ...prev,
      [key]: {
        scope,
        field: scope === "own" ? prev[key]?.field || "createdBy" : null,
      },
    }));
  };

  const updateField = (key, field) => {
    setPermissionsMap((prev) => ({
      ...prev,
      [key]: { ...prev[key], field },
    }));
  };

  const isChecked = (key) => Boolean(permissionsMap[key]);

  const isGroupAllSelected = (group) =>
    group.items.length > 0 &&
    group.items.every((p) => permissionsMap[p.key]);

  const toggleGroupAll = (group) => {
    setPermissionsMap((prev) => {
      const next = { ...prev };
      const keys = group.items.map((p) => p.key);

      const hasAll = keys.every((k) => next[k]);
      if (hasAll) {
        keys.forEach((k) => delete next[k]);
        return next;
      }

      keys.forEach((k) => {
        if (!next[k]) next[k] = { scope: "all", field: null };
      });
      return next;
    });
  };

  const onSubmit = async () => {
    const payload = Object.entries(permissionsMap).map(([key, v]) => ({
      key,
      scope: v.scope,
      field: v.scope === "own" ? v.field : null,
    }));

    await onSave?.(payload);
  };

  // =====================
  // RENDER
  // =====================
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Heading size="md">Manage Permissions</Heading>
            <Tag colorScheme="blue" variant="subtle">
              <TagLabel>{role?.code || "ROLE"}</TagLabel>
            </Tag>
          </HStack>
          <Text fontSize="sm" opacity={0.7} mt={1}>
            Chọn permission và scope áp dụng
          </Text>
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody>
          <Stack spacing={6}>
            {groups.map((g) => (
              <Box key={g.groupKey} borderWidth="1px" rounded="lg" p={4}>
                <Flex justify="space-between" align="center">
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

                <Stack spacing={3}>
                  {g.items.map((p) => {
                    const checked = isChecked(p.key);
                    const value = permissionsMap[p.key];

                    return (
                      <HStack key={p.key} spacing={4} align="center">
                        <Checkbox
                          isChecked={checked}
                          onChange={(e) =>
                            togglePermission(p.key, e.target.checked)
                          }
                        >
                          <Text fontWeight="500">{p.label}</Text>
                        </Checkbox>

                        {checked && (
                          <Select
                            size="sm"
                            w="140px"
                            value={value.scope}
                            onChange={(e) =>
                              updateScope(p.key, e.target.value)
                            }
                          
                          >
                            {SCOPES.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </Select>
                        )}

                        {checked && value.scope === "own" && (
                          <Input
                            size="sm"
                            w="160px"
                            placeholder="createdBy"
                            value={value.field || ""}
                            onChange={(e) =>
                              updateField(p.key, e.target.value)
                            }
                          />
                        )}
                      </HStack>
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={onSubmit}
              isLoading={saving}
              isDisabled={!role}
            >
              Save ({Object.keys(permissionsMap).length})
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
