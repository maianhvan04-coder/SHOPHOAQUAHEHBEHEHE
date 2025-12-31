/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDisclosure } from "@chakra-ui/react";
import { useAuth } from "~/app/providers/AuthProvides";
import { canAccessScreen, matchRoute } from "~/shared/utils/ability";

import {
  Box,
  VStack,
  Flex,
  Text,
  Icon,
  Image,
  Divider,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerCloseButton,
  IconButton,
  Tooltip,
  Avatar,
  HStack,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";

import {
  Bars3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  UserGroupIcon,
  KeyIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  UserIcon,
   ShoppingBagIcon,
  TagIcon,
  ReceiptPercentIcon,
  ShieldCheckIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

import { authService } from "../../../features/auth/authService";

// icon string -> component
const ICON = {
  home: HomeIcon,
  users: UserGroupIcon,
  roles: KeyIcon,
  analytics: ChartBarIcon,
  settings: Cog6ToothIcon,
  logout: ArrowLeftOnRectangleIcon,
  calendar: CalendarIcon,
  departments: BuildingOfficeIcon,
  profile: UserIcon,

  //  category
  category: TagIcon,
  tags: TagIcon,

  //  product
  product: ShoppingBagIcon,
  package: ShoppingBagIcon,
  box: ShoppingBagIcon,

  //  orders
  order: ReceiptPercentIcon,
  orders: ReceiptPercentIcon,
  receipt: ReceiptPercentIcon,

  // rbac
  shield: ShieldCheckIcon,
  rbac: ShieldCheckIcon,
  permission: LockClosedIcon,
  permissions: LockClosedIcon,
};


export default function Sidebar({ groups, screens, userPermissions = [] }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });

  // ===== Modernize-like theme =====
  const sidebarBg = useColorModeValue("#0B1220", "#0B1220");
  const sidebarBorder = useColorModeValue("rgba(255,255,255,0.08)", "rgba(255,255,255,0.08)");
  const muted = useColorModeValue("rgba(255,255,255,0.60)", "rgba(255,255,255,0.60)");
  const muted2 = useColorModeValue("rgba(255,255,255,0.40)", "rgba(255,255,255,0.40)");

  const itemHoverBg = useColorModeValue("rgba(255,255,255,0.06)", "rgba(255,255,255,0.06)");
  const itemActiveBg = useColorModeValue("rgba(79,124,255,0.95)", "rgba(79,124,255,0.95)"); // pill xanh
  const itemActiveShadow = useColorModeValue(
    "0 10px 30px rgba(79,124,255,0.25)",
    "0 10px 30px rgba(79,124,255,0.25)"
  );

  const byGroup = useMemo(() => {
    const allowedScreens = (screens || []).filter((s) => canAccessScreen(userPermissions, s));
    const map = {};
    allowedScreens.forEach((s) => {
      const gkey = s.group;
      map[gkey] = map[gkey] || [];
      map[gkey].push(s);
    });
    Object.keys(map).forEach((k) => map[k].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    return map;
  }, [screens, userPermissions]);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const NavItem = ({ label, to, iconKey, onClick, onItemClose }) => {
    const active = to ? matchRoute(to, pathname) : false;
    const IconComp = (iconKey && ICON[iconKey]) || UserIcon;

    const pill = (
      <Flex
        role="group"
        align="center"
        gap="12px"
        px={isCollapsed ? 3 : 4}
        py="10px"
        mx={isCollapsed ? 2 : 3}
        rounded="xl"
        transition="all 180ms ease"
        bg={active ? itemActiveBg : "transparent"}
        boxShadow={active ? itemActiveShadow : "none"}
        _hover={{
          bg: active ? itemActiveBg : itemHoverBg,
          transform: "translateY(-1px)",
        }}
        _active={{ transform: "translateY(0px)" }}
      >
        <Box
          w="36px"
          h="36px"
          rounded="lg"
          display="grid"
          placeItems="center"
          bg={active ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.04)"}
          transition="all 180ms ease"
          _groupHover={{ bg: active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)" }}
        >
          <Icon as={IconComp} boxSize="5" color="white" opacity={active ? 1 : 0.92} />
        </Box>

        {!isCollapsed && (
          <Text
            fontSize="sm"
            fontWeight={active ? 700 : 600}
            color="white"
            letterSpacing="0.2px"
            noOfLines={1}
          >
            {label}
          </Text>
        )}
      </Flex>
    );

    // click-only item (logout)
    if (onClick) {
      return (
        <Tooltip label={isCollapsed ? label : ""} placement="right" hasArrow>
          <Box
            as="button"
            w="full"
            textAlign="left"
            onClick={() => {
              onClick();
              onItemClose?.();
            }}
          >
            {pill}
          </Box>
        </Tooltip>
      );
    }

    return (
      <Tooltip label={isCollapsed ? label : ""} placement="right" hasArrow>
        <Box
          as={NavLink}
          to={to || "#"}
          w="full"
          onClick={() => onItemClose?.()}
          style={{ textDecoration: "none" }}
        >
          {pill}
        </Box>
      </Tooltip>
    );
  };

  const SectionTitle = ({ children }) =>
    isCollapsed ? null : (
      <Text
        px="6"
        pt="14px"
        pb="8px"
        fontSize="xs"
        fontWeight="800"
        letterSpacing="0.12em"
        textTransform="uppercase"
        color={muted2}
      >
        {children}
      </Text>
    );

  const SidebarContent = ({ onDrawerClose }) => (
    <Box
       bg={sidebarBg}
    h="100vh"
    position="sticky"
    top="0"
    borderRight="1px solid"
    borderColor={sidebarBorder}
    w={isCollapsed ? "84px" : "290px"}
    transition="width 220ms ease"

    // ✅ quan trọng
    display="flex"
    flexDirection="column"
    overflowX="hidden"
    overflowY="auto"
    sx={{
      "&::-webkit-scrollbar": { width: "6px" },
      "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.18)", borderRadius: "999px" },
      "&::-webkit-scrollbar-track": { background: "transparent" },
    }}
    >
      {/* Top bar */}
      <Flex align="center" justify="space-between" px={isCollapsed ? 4 : 6} pt="18px" pb="14px">
        <HStack spacing="12px" overflow="hidden">
          <Box
            w="36px"
            h="36px"
            rounded="xl"
            bg="rgba(79,124,255,0.18)"
            display="grid"
            placeItems="center"
          >
            <Image
              src="/vite.svg"
              alt="Logo"
              w="18px"
              h="18px"
              draggable={false}
              fallbackSrc="https://via.placeholder.com/18"
            />
          </Box>

          {!isCollapsed && (
            <Box lineHeight="1.1">
              <Text fontSize="lg" fontWeight="800" color="white">
                JOYGREEN
              </Text>
              <Text fontSize="xs" color={muted} mt="2px">
                Role Management System
              </Text>
            </Box>
          )}
        </HStack>

        {/* Collapse toggle (desktop) */}
        <IconButton
          aria-label={isCollapsed ? "Expand" : "Collapse"}
          icon={isCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
          size="sm"
          variant="ghost"
          display={{ base: "none", md: "inline-flex" }}
          color="white"
          _hover={{ bg: "rgba(255,255,255,0.06)" }}
          onClick={() => setIsCollapsed((v) => !v)}
        />
      </Flex>

      <Divider borderColor={sidebarBorder} />

      {/* Menu */}
      <Box py="10px" pb="0">
        <VStack align="stretch" spacing="0">
          {(groups || []).map((g) => {
            const list = byGroup[g.key] || [];
            if (!list.length) return null;

            return (
              <Box key={g.key}>
                <SectionTitle>{g.label || g.name || g.key}</SectionTitle>

                <VStack spacing="4px" align="stretch" pb="10px">
                  {list.map((s) => {
                    const to = (s.routes && s.routes[0]) || s.href || "#";
                    return (
                      <NavItem
                        key={s.key}
                        label={s.label || s.name || s.key}
                        to={to}
                        iconKey={s.icon}
                        onItemClose={onDrawerClose}
                      />
                    );
                  })}
                </VStack>
              </Box>
            );
          })}
        </VStack>
      </Box>

      {/* Bottom actions + user */}
      <Box mt="auto" pb="18px">
        <Divider borderColor={sidebarBorder} my="10px" />

        <SectionTitle>System</SectionTitle>
        <VStack spacing="4px" align="stretch" pb="12px">
          <NavItem label="Settings" to="/settings" iconKey="settings" onItemClose={onDrawerClose} />
          <NavItem label="Logout" iconKey="logout" onClick={handleLogout} onItemClose={onDrawerClose} />
        </VStack>

        {/* User card */}
        <Box px={isCollapsed ? 2 : 4}>
          <Tooltip
            label={isCollapsed ? `${user?.fullName || user?.name || "Unknown"}\n${user?.email || ""}` : ""}
            placement="right"
            hasArrow
            whiteSpace="pre-line"
          >
            <Flex
              align="center"
              gap="12px"
              p="12px"
              rounded="2xl"
              bg="rgba(255,255,255,0.05)"
              border="1px solid"
              borderColor="rgba(255,255,255,0.08)"
              _hover={{ bg: "rgba(255,255,255,0.07)" }}
              transition="all 180ms ease"
            >
              <Avatar
                size="sm"
                name={user?.fullName || user?.name || "U"}
                src={user?.avatar}
              />
              {!isCollapsed && (
                <Box minW={0}>
                  <Text fontSize="sm" fontWeight="700" color="white" noOfLines={1}>
                    {user?.fullName || user?.name || "Unknown"}
                  </Text>
                  <Text fontSize="xs" color={muted} noOfLines={1}>
                    {user?.email || "no@email.com"}
                  </Text>
                </Box>
              )}
            </Flex>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  const MobileMenuButton = () => (
    <IconButton
      display={{ base: "inline-flex", md: "none" }}
      onClick={onOpen}
      variant="ghost"
      position="fixed"
      top="14px"
      left="14px"
      zIndex={1000}
      icon={<Bars3Icon className="h-6 w-6" />}
      aria-label="Open menu"
      color="white"
      _hover={{ bg: "rgba(255,255,255,0.08)" }}
    />
  );

  return (
    <>
      <MobileMenuButton />

      {/* Desktop */}
      <Box as="aside" display={{ base: "none", md: "block" }}>
        <SidebarContent />
      </Box>

      {/* Mobile */}
      <Box display={{ base: "block", md: "none" }}>
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent bg={sidebarBg} maxW="86vw">
            <DrawerCloseButton color="white" />
            <SidebarContent onDrawerClose={onClose} />
          </DrawerContent>
        </Drawer>
      </Box>
    </>
  );
}
