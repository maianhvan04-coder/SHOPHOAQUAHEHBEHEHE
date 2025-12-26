import { Outlet, useOutletContext } from "react-router-dom";
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import { useAuth } from "../../app/providers/AuthProvides";
import Header from "./Header";
import Sidebar from "./Sidebar";

function Layout() {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const glowColor = useColorModeValue("rgba(48, 73, 69, 0.3)", "rgba(48, 73, 69, 0.3)");
  const meshGradient = useColorModeValue(
    "radial-gradient(at 100% 0%, rgba(48, 73, 69, 0.05) 0%, transparent 50%), radial-gradient(at 0% 100%, rgba(48, 73, 69, 0.03) 0%, transparent 50%)",
    "radial-gradient(at 100% 0%, rgba(48, 73, 69, 0.15) 0%, transparent 50%), radial-gradient(at 0% 100%, rgba(48, 73, 69, 0.1) 0%, transparent 50%)"
  );
  const ambientLight = useColorModeValue(
    "radial-gradient(circle, rgba(48, 73, 69, 0.03) 0%, transparent 70%)",
    "radial-gradient(circle, rgba(48, 73, 69, 0.07) 0%, transparent 70%)"
  );
  const scrollbarThumb = useColorModeValue("gray.200", "gray.700");

  const { permissions } = useAuth();
  const { groups, screens } = useOutletContext(); // ✅ lấy từ AdminRoute

  return (
    <Flex h="100vh" bg={bgColor} position="relative" overflow="hidden">
      <Box position="fixed" inset="0" opacity="0.8" bgGradient={meshGradient} pointerEvents="none" zIndex={0} />
      <Box
        position="fixed"
        inset="0"
        opacity="0.4"
        backgroundImage={`linear-gradient(${glowColor} 1px, transparent 1px), linear-gradient(to right, ${glowColor} 1px, transparent 1px)`}
        backgroundSize="64px 64px"
        mask="linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)"
        pointerEvents="none"
        zIndex={0}
      />
      <Box
        position="fixed"
        top="-50%"
        right="-25%"
        width="80%"
        height="80%"
        background={ambientLight}
        filter="blur(100px)"
        transform="rotate(-15deg)"
        pointerEvents="none"
        zIndex={0}
      />

      <Box position="relative" zIndex={2}>
        <Sidebar groups={groups} screens={screens} userPermissions={permissions} />
      </Box>

      <Box flex="1" overflow="hidden" position="relative" zIndex={1}>
        <Box position="relative" zIndex={3}>
          <Header />
        </Box>

        <Box
          as="main"
          h="calc(100vh - 4rem)"
          overflow="auto"
          position="relative"
          zIndex={1}
          css={{
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-track": { width: "6px" },
            "&::-webkit-scrollbar-thumb": { background: scrollbarThumb, borderRadius: "24px" },
          }}
        >
          <Box position="relative" zIndex={2}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}

export default Layout;
