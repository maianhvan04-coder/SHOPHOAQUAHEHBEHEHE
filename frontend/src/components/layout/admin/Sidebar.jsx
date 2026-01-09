import { useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  useDisclosure,
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
  UserIcon,
  ShoppingBagIcon,
  TagIcon,
  ReceiptPercentIcon,
  ShieldCheckIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

import { useAuth } from "~/app/providers/AuthProvides";
import { canAccessScreen, matchRoute } from "~/shared/utils/ability";
import { authService } from "~/features/auth/authService";

// icon map
const ICON = {
  home: HomeIcon,
  users: UserGroupIcon,
  roles: KeyIcon,
  analytics: ChartBarIcon,
  settings: Cog6ToothIcon,
  logout: ArrowLeftOnRectangleIcon,
  profile: UserIcon,
  category: TagIcon,
  product: ShoppingBagIcon,
  order: ReceiptPercentIcon,
  rbac: ShieldCheckIcon,
  permission: LockClosedIcon,
};

const FALLBACK_18 =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18">
      <rect width="18" height="18" rx="5" fill="#4F7CFF"/>
      <text x="9" y="12.3" text-anchor="middle" font-size="10" fill="white" font-weight="700">J</text>
    </svg>`
  );

export default function Sidebar({ groups, screens, userPermissions = [] }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });

  const sidebarBg = useColorModeValue("#0B1220", "#0B1220");
  const sidebarBorder = "rgba(255,255,255,0.08)";
  const muted = "rgba(255,255,255,0.6)";
  const muted2 = "rgba(255,255,255,0.4)";

  const itemHoverBg = "rgba(255,255,255,0.06)";
  const itemActiveBg = "rgba(79,124,255,0.95)";
  const itemActiveShadow = "0 10px 30px rgba(79,124,255,0.25)";

  // ===== DASHBOARD =====
  const dashboardScreen = useMemo(
    () =>
      (screens || []).find(
        (s) => s.key === "dashboard" && (s.public || canAccessScreen(userPermissions, s))
      ),
    [screens, userPermissions]
  );

  // ===== GROUPED SCREENS =====
  const byGroup = useMemo(() => {
    const allowed = (screens || []).filter(
      (s) => s.group && (s.public || canAccessScreen(userPermissions, s))
    );

    const map = {};
    allowed.forEach((s) => {
      map[s.group] = map[s.group] || [];
      map[s.group].push(s);
    });

    Object.keys(map).forEach((k) =>
      map[k].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    );

    return map;
  }, [screens, userPermissions]);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const NavItem = ({ label, to, iconKey, onClick }) => {
    const active = to ? matchRoute(to, pathname) : false;
    const IconComp = ICON[iconKey] || UserIcon;

    const content = (
      <Flex
        align="center"
        gap="12px"
        px={isCollapsed ? 3 : 4}
        py="10px"
        mx={isCollapsed ? 2 : 3}
        rounded="xl"
        bg={active ? itemActiveBg : "transparent"}
        boxShadow={active ? itemActiveShadow : "none"}
        _hover={{ bg: active ? itemActiveBg : itemHoverBg }}
      >
        <Box w="36px" h="36px" display="grid" placeItems="center">
          <Icon as={IconComp} boxSize="5" color="white" />
        </Box>
        {!isCollapsed && (
          <Text fontSize="sm" fontWeight={active ? 700 : 600} color="white">
            {label}
          </Text>
        )}
      </Flex>
    );

    if (onClick) {
      return <Box as="button" w="full" onClick={onClick}>{content}</Box>;
    }

    return (
      <Box as={NavLink} to={to} w="full" style={{ textDecoration: "none" }}>
        {content}
      </Box>
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

  const SidebarContent = () => (
    <Box
      bg={sidebarBg}
      h="100vh"
      w={isCollapsed ? "84px" : "290px"}
      borderRight="1px solid"
      borderColor={sidebarBorder}
      display="flex"
      flexDirection="column"
    >
      {/* Logo */}
      <Flex align="center" justify="space-between" px={6} py={4}>
        <HStack>
          <Image src="/vite.svg" w="18px" fallbackSrc={FALLBACK_18} />
          {!isCollapsed && <Text color="white" fontWeight="800">JOYGREEN</Text>}
        </HStack>
        <IconButton
          size="sm"
          variant="ghost"
          icon={isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          onClick={() => setIsCollapsed((v) => !v)}
        />
      </Flex>

      <Divider borderColor={sidebarBorder} />

      

      {/* GROUPS */}
      <Box flex="1" overflowY="auto">
        {/* DASHBOARD */}
      {dashboardScreen && (
        <VStack align="stretch" py={3}>
          <NavItem
            label={dashboardScreen.label}
            to={dashboardScreen.routes?.[0]}
            iconKey={dashboardScreen.icon || "home"}
          />
        </VStack>
      )}
        {(groups || []).map((g) => {
          const list = byGroup[g.key] || [];
          if (!list.length) return null;

          return (
            <Box key={g.key}>
              <SectionTitle>{g.label}</SectionTitle>
              {list.map((s) => (
                <NavItem
                  key={s.key}
                  label={s.label}
                  to={s.routes?.[0]}
                  iconKey={s.icon}
                />
              ))}
            </Box>
          );
        })}
         <NavItem label="Logout" iconKey="logout" onClick={handleLogout} />
      </Box>

      <Divider borderColor={sidebarBorder} />

      <Box p={4}>
        <Flex align="center" gap={3}>
          <Avatar size="sm" name={user?.fullName} />
          {!isCollapsed && (
            <Box>
              <Text color="white" fontSize="sm">{user?.fullName}</Text>
              <Text color={muted} fontSize="xs">{user?.email}</Text>
            </Box>
          )}
        </Flex>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          icon={<Bars3Icon />}
          position="fixed"
          top="14px"
          left="14px"
          onClick={onOpen}
        />
      )}

      <Box display={{ base: "none", md: "block" }}>
        <SidebarContent />
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={sidebarBg}>
          <DrawerCloseButton />
          <SidebarContent />
        </DrawerContent>
      </Drawer>
    </>
  );
}
