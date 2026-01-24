import {
  Grid,
  GridItem,
  Box,
  Heading,
  VStack,
  Flex,
  Button,
  Badge,
  HStack,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import VersionList from "~/components/template/VersionList";
import { useTemplateDetail } from "~/features/template/hooks/useTemplateDetail";
import TemplatePreview from "~/components/template/TemplatePreview";

export default function TemplateDetailPage() {
  const { type } = useParams();
  const { template, loading } = useTemplateDetail(type);

  const [selectedVersion, setSelectedVersion] = useState(null);

  useEffect(() => {
    if (!template?.data) return;
    if (selectedVersion == null) {
      setSelectedVersion(template.data.activeVersion);
    }
  }, [template?.data?.activeVersion]);

  if (loading) return null;
  if (!template?.data) return null;

  const { versions, activeVersion } = template.data;

  const effectiveVersion = selectedVersion ?? activeVersion;

  const currentVersion = versions.find(
    (v) =>
      v.version === Number(effectiveVersion) &&
      v.isDeleted !== true
  );

  if (!currentVersion) return null;

  const isActive = currentVersion.version === activeVersion;

  return (
    <Box p={8} h="100vh" bg="gray.50">
      {/* ===== ONE SINGLE CARD ===== */}
      <Card
        h="100%"
        borderRadius="xl"
        boxShadow="lg"
        overflow="hidden"
      >
        <CardBody p={0} h="100%">
          <Grid
            templateColumns="280px 1fr" // 👉 preview rộng hơn
            h="100%"
          >
            {/* =======================
                SIDEBAR – VERSION LIST
                ======================= */}
            <GridItem
              borderRight="1px solid"
              borderColor="gray.200"
              p={6}
              overflowY="auto"
              bg="gray.50"
            >
              <VStack align="stretch" spacing={4}>
                <Heading
                  size="xs"
                  textTransform="uppercase"
                  letterSpacing="0.5px"
                  color="gray.600"
                >
                  Versions
                </Heading>

                <VersionList
                  versions={versions}
                  type={type}
                  activeVersion={activeVersion}
                  currentVersion={currentVersion}
                  selectedVersion={selectedVersion}
                  onSelect={setSelectedVersion}
                />
              </VStack>
            </GridItem>

            {/* =======================
                PREVIEW AREA (MAIN)
                ======================= */}
            <GridItem
              display="flex"
              flexDir="column"
              overflow="hidden"
              bg="white"
            >
              {/* ===== Preview Header ===== */}
              <Flex
                px={6}
                py={4}
                borderBottom="1px solid"
                borderColor="gray.200"
                justify="space-between"
                align="center"
                flexShrink={0}
              >
                <HStack spacing={3}>
                  <Heading size="sm">
                    Version v{currentVersion.version}
                  </Heading>

                  {isActive && (
                    <Badge colorScheme="green">ACTIVE</Badge>
                  )}
                </HStack>

                <HStack spacing={2}>
                  {!isActive && (
                    <Button
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      as={Link}
                      to={`/admin/templates/${type}/version/${currentVersion.version}/edit`}
                    >
                      Update Version
                    </Button>
                  )}
                </HStack>
              </Flex>

              {/* ===== Preview Body ===== */}
              <Box
                p={10}            
                overflowY="auto"
                flex="1"
                bg="gray.50"
              >
                <TemplatePreview
                  data={currentVersion}
                 
                  allowToggle
                />
              </Box>
            </GridItem>
          </Grid>
        </CardBody>
      </Card>
    </Box>
  );
}
