import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  Text,
  Icon,
  Card,
  CardBody,
  HStack,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FiPlus, FiEye, FiFileText, FiClock } from "react-icons/fi";
import { useTemplateList } from "~/features/template/hooks/useTemplateList";

export default function TemplateListPage() {
  const { items, loading, error } = useTemplateList();
  
  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1400px" mx="auto">
      {/* Header Section */}
      <Flex 
        justify="space-between" 
        align="center" 
        mb={8}
        flexDir={{ base: "column", md: "row" }}
        gap={4}
      >
        <VStack align={{ base: "center", md: "flex-start" }} spacing={2}>
          <Heading size="lg" color="blue.600">
            Template Management
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Manage and configure your document templates
          </Text>
        </VStack>

        <Button
          as={Link}
          to="/admin/templates/create"
          colorScheme="blue"
          leftIcon={<Icon as={FiPlus} />}
          size="md"
          px={6}
          shadow="sm"
          _hover={{ shadow: "md", transform: "translateY(-2px)" }}
          transition="all 0.2s"
        >
          Create Template
        </Button>
      </Flex>

      {/* Loading State */}
      {loading && (
        <Flex justify="center" align="center" minH="300px">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text color="gray.500">Loading templates...</Text>
          </VStack>
        </Flex>
      )}

      {/* Error State */}
      {error && (
        <Alert 
          status="error" 
          borderRadius="lg" 
          mb={4}
          variant="left-accent"
        >
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Error Loading Templates</Text>
            <Text fontSize="sm">Unable to load template list. Please try again.</Text>
          </Box>
        </Alert>
      )}

      {/* Table Content */}
      {!loading && !error && (
        <Card 
          bg={bgCard}
          shadow="lg"
          borderRadius="xl"
          overflow="hidden"
          border="1px"
          borderColor={borderColor}
        >
          <CardBody p={0}>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead bg={useColorModeValue("gray.50", "gray.900")}>
                  <Tr>
                    <Th 
                      fontSize="xs" 
                      textTransform="uppercase" 
                      letterSpacing="wider"
                      py={4}
                    >
                      <HStack spacing={2}>
                        <Icon as={FiFileText} />
                        <Text>Template Type</Text>
                      </HStack>
                    </Th>
                    <Th 
                      fontSize="xs" 
                      textTransform="uppercase" 
                      letterSpacing="wider"
                      py={4}
                    >
                      Active Version
                    </Th>
                    <Th 
                      fontSize="xs" 
                      textTransform="uppercase" 
                      letterSpacing="wider"
                      py={4}
                    >
                      Total Versions
                    </Th>
                    <Th 
                      fontSize="xs" 
                      textTransform="uppercase" 
                      letterSpacing="wider"
                      py={4}
                    >
                      <HStack spacing={2}>
                        <Icon as={FiClock} />
                        <Text>Last Updated</Text>
                      </HStack>
                    </Th>
                    <Th 
                      fontSize="xs" 
                      textTransform="uppercase" 
                      letterSpacing="wider"
                      py={4}
                      textAlign="right"
                    >
                      Actions
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {items.map((t) => (
                    <Tr 
                      key={t.type}
                      _hover={{ bg: hoverBg }}
                      transition="background 0.2s"
                    >
                      <Td py={4}>
                        <Text fontWeight="semibold" fontSize="md">
                          {t.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </Text>
                      </Td>
                      <Td py={4}>
                        <Badge 
                          colorScheme="green" 
                          fontSize="sm"
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontWeight="bold"
                        >
                          v{t.activeVersion}
                        </Badge>
                      </Td>
                      <Td py={4}>
                        <Badge 
                          colorScheme="blue" 
                          variant="subtle"
                          fontSize="sm"
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          {t.versionCounter} {t.versionCounter === 1 ? 'version' : 'versions'}
                        </Badge>
                      </Td>
                      <Td py={4}>
                        <Text fontSize="sm" color="gray.600">
                          {new Date(t.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </Td>
                      <Td py={4} textAlign="right">
                        <Button
                          as={Link}
                          to={`/admin/templates/details/${t.type}`}
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          leftIcon={<Icon as={FiEye} />}
                          _hover={{ 
                            bg: "blue.50", 
                            transform: "translateY(-1px)",
                            shadow: "sm"
                          }}
                          transition="all 0.2s"
                        >
                          View Details
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            {/* Empty State */}
            {items.length === 0 && (
              <Flex 
                direction="column" 
                align="center" 
                justify="center" 
                py={16}
                px={4}
              >
                <Icon as={FiFileText} boxSize={16} color="gray.300" mb={4} />
                <Heading size="md" color="gray.500" mb={2}>
                  No Templates Found
                </Heading>
                <Text color="gray.400" mb={6} textAlign="center">
                  Get started by creating your first template
                </Text>
                <Button
                  as={Link}
                  to="/admin/templates/create"
                  colorScheme="blue"
                  leftIcon={<Icon as={FiPlus} />}
                >
                  Create First Template
                </Button>
              </Flex>
            )}
          </CardBody>
        </Card>
      )}

      {/* Footer Info */}
      {!loading && !error && items.length > 0 && (
        <Flex justify="space-between" align="center" mt={4} px={2}>
          <Text fontSize="sm" color="gray.500">
            Showing {items.length} template{items.length !== 1 ? 's' : ''}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Total: {items.length}
          </Text>
        </Flex>
      )}
    </Box>
  );
}