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
];

export default function RolePermissionsModal({
  isOpen,
  onClose,
  role,
  allPermissions = [],
  initialPermissions = [],
  onSave,
  saving,
}) {
  const [permissionsMap, setPermissionsMap] = useState({});
  const initRef = useRef(false);

  // ✅ INIT 1 LẦN KHI OPEN
  useEffect(() => {
    if (!isOpen) {
      initRef.current = false;
      return;
    }
    if (initRef.current) return;

    const map = {};
    initialPermissions.forEach((p) => {
      map[p.key] = {
        scope: p.scope || "all",
        field: p.field || null,
      };
    });

    setPermissionsMap(map);
    initRef.current = true;
  }, [isOpen, initialPermissions]);

  // GROUP PERMISSIONS
  const groups = useMemo(() => {
    const m = new Map();
    allPermissions.forEach((p) => {
      const g = p.groupKey || "OTHER";
      if (!m.has(g)) m.set(g, { label: p.groupLabel, items: [] });
      m.get(g).items.push(p);
    });
    return Array.from(m.entries());
  }, [allPermissions]);

  const toggle = (key, checked) => {
    setPermissionsMap((prev) => {
      const next = { ...prev };
      if (!checked) delete next[key];
      else next[key] = { scope: "all", field: null };
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

  const onSubmit = async () => {
    const permissions = Object.entries(permissionsMap).map(([key, v]) => ({
      key,
      scope: v.scope,
      field: v.scope === "own" ? v.field : null,
    }));
    await onSave({ roleCode: role.code, permissions });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Heading size="md">Manage Permissions</Heading>
            <Tag><TagLabel>{role?.code}</TagLabel></Tag>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Stack spacing={6}>
            {groups.map(([groupKey, g]) => (
              <Box key={groupKey} borderWidth="1px" rounded="lg" p={4}>
                <Heading size="sm">{g.label}</Heading>
                <Divider my={3} />
                <Stack spacing={3}>
                  {g.items.map((p) => {
                    const checked = !!permissionsMap[p.key];
                    const val = permissionsMap[p.key];

                    return (
                      <HStack key={p.key} spacing={4}>
                        <Checkbox
                          isChecked={checked}
                          onChange={(e) => toggle(p.key, e.target.checked)}
                        >
                          <Text>{p.label}</Text>
                        </Checkbox>

                        {checked && (
                          <Select
                            size="sm"
                            w="120px"
                            value={val.scope}
                            onChange={(e) =>
                              updateScope(p.key, e.target.value)
                            }
                            isDisabled={p.key.endsWith(":read")}
                          >
                            {SCOPES.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </Select>
                        )}

                        {checked && val.scope === "own" && (
                          <Input
                            size="sm"
                            w="160px"
                            value={val.field || ""}
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
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button
            ml={3}
            colorScheme="blue"
            onClick={onSubmit}
            isLoading={saving}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
