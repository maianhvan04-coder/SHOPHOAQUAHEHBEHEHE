import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Spinner,
  Text,
  Box,
  Icon,
} from "@chakra-ui/react";
import { HiOutlineClipboardList } from "react-icons/hi"; // Example icon import

import Pagination from "~/components/common/Pagination";
import { useProductHistory } from "~/features/product/hooks/useProductHistory";
import ProductHistoryTimeline from "~/features/product/components/admin/components/history/ProductHistoryTimeline";

export default function ProductHistoryModal({ isOpen, onClose, product }) {
  const {
    items,
    pagination,
    loading,
    page,
    setPage,
  } = useProductHistory(product?._id, { enabled: isOpen });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg="white" p={4}>
        <ModalHeader fontSize="lg" fontWeight="bold">
          Lịch sử thay đổi – {product?.name}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Spinner size="lg" />
            </Box>
          ) : items.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Icon as={HiOutlineClipboardList} boxSize={8} color="gray.300" />
              <Text color="gray.500" mt={2}>
                Chưa có lịch sử thay đổi
              </Text>
            </Box>
          ) : (
            <>
              <Box py={2}>
                <ProductHistoryTimeline items={items} />
              </Box>

              {!!pagination && (
                <Pagination
                  page={pagination.page}
                  limit={pagination.limit}
                  total={pagination.total}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}