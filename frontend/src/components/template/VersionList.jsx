import {
  VStack,
  Button,
  Badge,
  HStack,
  Icon,
  useDisclosure,
} from "@chakra-ui/react";
import { FiPlus, FiCheck } from "react-icons/fi";

import AddVersionModal from "./AddVersionModal";
import { useTemplateVersionActions } from "~/features/template/hooks/useTemplateVersionActions";

export default function VersionList({
  versions,
  activeVersion,     
  selectedVersion,  
  onSelect,
  type,
  reload,
  currentVersion,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  console.log(currentVersion)
  const { addVersion, activateVersion } =
    useTemplateVersionActions({
      type,
      onSuccess: reload,
    });

  return (
    <>
      <VStack align="stretch" spacing={2}>
        {versions.map((v) => {
          const isActive = v.version === activeVersion;
          const isSelected = v.version === selectedVersion;

          return (
            <HStack key={v.version} justify="space-between">
              {/* CLICK = PREVIEW */}
              <Button
                variant="ghost"
                justifyContent="flex-start"
                fontWeight={isSelected ? "bold" : "normal"}
                bg={isSelected ? "blue.50" : "transparent"}
                color={isSelected ? "blue.600" : "gray.700"}
                onClick={() => onSelect(v.version)}
              >
                v{v.version}
              </Button>

              {/* ACTIVE CHỈ THEO BACKEND */}
              {isActive ? (
                <Badge colorScheme="green">ACTIVE</Badge>
              ) : (
                <Button
                  size="xs"
                  leftIcon={<Icon as={FiCheck} />}
                  onClick={() => activateVersion(v.version)}
                >
                  Activate
                </Button>
              )}
            </HStack>
          );
        })}

        <Button
          leftIcon={<Icon as={FiPlus} />}
          variant="outline"
          onClick={onOpen}
        >
          Add Version
        </Button>
      </VStack>

      <AddVersionModal
        isOpen={isOpen}
        onClose={onClose}
        baseVersion={currentVersion}
        onSubmit={addVersion}
      />
    </>
  );
}
