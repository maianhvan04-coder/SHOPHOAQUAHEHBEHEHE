import PropTypes from "prop-types";
import Modal from "~/components/common/Modal";

import { Box, Button, HStack, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { TrashIcon } from "@heroicons/react/24/outline";

export default function DeleteModals({
  isDeleteOpen,
  closeDelete,
  productToDelete,
  onConfirmDelete,
  isLoading,

  isBulkDeleteOpen,
  closeBulkDelete,
  confirmBulkDelete,
  selectedCount,
}) {
  const titleColor = useColorModeValue("gray.800", "gray.100");

  return (
    <>
      {/* Single delete */}
      <Modal isOpen={isDeleteOpen} onClose={closeDelete} title="Xác nhận xoá" isCentered>
        <Box p={2}>
          <VStack spacing={4} align="center" mb={6}>
            <Box p={3} bg="red.50" borderRadius="full">
              <TrashIcon className="h-8 w-8 text-red-500" />
            </Box>

            <Box textAlign="center">
              <Text fontWeight="900" fontSize="lg">
                Xoá sản phẩm?
              </Text>

              <Text color="gray.500" fontSize="sm" mt={2}>
                Bạn sắp xoá{" "}
                <Text as="span" fontWeight="900" color={titleColor}>
                  "{productToDelete?.name}"
                </Text>
                . <br />
                Hành động này sẽ chuyển sản phẩm vào thùng rác.
              </Text>
            </Box>
          </VStack>

          <HStack spacing={3} justify="center" w="full">
            <Button variant="ghost" onClick={closeDelete} w="full" borderRadius="xl">
              Huỷ bỏ
            </Button>
            <Button
              colorScheme="red"
              onClick={onConfirmDelete}
              w="full"
              isLoading={isLoading}
              borderRadius="xl"
            >
              Đồng ý xoá
            </Button>
          </HStack>
        </Box>
      </Modal>

      {/* Bulk delete */}
      <Modal isOpen={isBulkDeleteOpen} onClose={closeBulkDelete} title="Xác nhận xoá hàng loạt" isCentered>
        <Box p={2}>
          <VStack spacing={4} align="center" mb={6}>
            <Box p={3} bg="red.50" borderRadius="full">
              <TrashIcon className="h-8 w-8 text-red-500" />
            </Box>

            <Box textAlign="center">
              <Text fontWeight="900" fontSize="lg">
                Xoá {selectedCount} sản phẩm?
              </Text>
              <Text color="gray.500" fontSize="sm" mt={2}>
                Các sản phẩm sẽ được chuyển vào thùng rác.
              </Text>
            </Box>
          </VStack>

          <HStack spacing={3} justify="center" w="full">
            <Button variant="ghost" onClick={closeBulkDelete} w="full" borderRadius="xl">
              Huỷ bỏ
            </Button>
            <Button
              colorScheme="red"
              onClick={confirmBulkDelete}
              w="full"
              isLoading={isLoading}
              borderRadius="xl"
            >
              Đồng ý xoá
            </Button>
          </HStack>
        </Box>
      </Modal>
    </>
  );
}

DeleteModals.propTypes = {
  isDeleteOpen: PropTypes.bool,
  closeDelete: PropTypes.func,
  productToDelete: PropTypes.object,
  onConfirmDelete: PropTypes.func,
  isLoading: PropTypes.bool,

  isBulkDeleteOpen: PropTypes.bool,
  closeBulkDelete: PropTypes.func,
  confirmBulkDelete: PropTypes.func,
  selectedCount: PropTypes.number,
};
