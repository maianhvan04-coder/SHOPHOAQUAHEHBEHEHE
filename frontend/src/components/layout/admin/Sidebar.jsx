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
  Avatar,
  HStack,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
  Collapse,
} from "@chakra-ui/react";

import {
  Bars3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
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

/* ================= ICON MAP ================= */
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
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18">
      <rect width="18" height="18" rx="5" fill="#4F7CFF"/>
      <text x="9" y="12.3" text-anchor="middle"
        font-size="10" fill="white" font-weight="700">J</text>
    </svg>
  `);

/* ================= HELPERS ================= */
const isActiveRoute = (routes = [], pathname) =>
  routes.some((r) => matchRoute(r, pathname));

/* ================= COMPONENT ================= */
export default function Sidebar({ groups = [], screens = [], userPermissions = {} }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const isMobile = useBreakpointValue({ base: true, md: false });

  const sidebarBg = useColorModeValue("#0B1220", "#0B1220");
  const sidebarBorder = "rgba(255,255,255,0.08)";
  const muted = "rgba(255,255,255,0.6)";
  const muted2 = "rgba(255,255,255,0.4)";

  const itemHoverBg = "rgba(255,255,255,0.06)";
  const itemActiveBg = "rgba(79,124,255,0.95)";
  const itemActiveShadow = "0 10px 30px rgba(79,124,255,0.25)";
  const childHoverBg = "rgba(79,124,255,0.15)";
  const childActiveBg = "rgba(79,124,255,0.25)";

  /* ================= DASHBOARD ================= */
  const dashboardScreen = useMemo(
    () =>
      screens.find(
        (s) =>
          s.key === "dashboard" &&
          (s.public || canAccessScreen(userPermissions, s, { mode: "menu" }))
      ),
    [screens, userPermissions]
  );

  /* ================= GROUP + CHILDREN ================= */
  const byGroup = useMemo(() => {
    const map = {};
    groups.forEach((g) => (map[g.key] = []));

    screens.forEach((screen) => {
      if (!screen.group) return;

      const rawChildren = Array.isArray(screen.children)
        ? screen.children
        : screen.children && typeof screen.children === "object"
          ? Object.values(screen.children)
          : [];

      const children = rawChildren.filter((c) =>
        canAccessScreen(userPermissions, c, { mode: "menu" })
      );

      const canShowParent =
        screen.public ||
        canAccessScreen(userPermissions, screen, { mode: "menu" }) ||
        children.length > 0;

      if (!canShowParent) return;

      map[screen.group]?.push({
        ...screen,
        _children: children,
      });
    });

    Object.keys(map).forEach((k) =>
      map[k].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    );

    return map;
  }, [screens, groups, userPermissions]);

  /* ================= AUTO EXPAND PARENT ================= */
  useMemo(() => {
    const newExpanded = {};
    Object.entries(byGroup).forEach(([groupKey, list]) => {
      list.forEach((screen) => {
        const hasActiveChild = screen._children?.some((c) =>
          isActiveRoute(c.routes, pathname)
        );
        if (hasActiveChild) {
          newExpanded[screen.key] = true;
        }
      });
    });
    setExpandedGroups(newExpanded);
  }, [pathname, byGroup]);

  /* ================= ACTIONS ================= */
  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const toggleExpand = (screenKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [screenKey]: !prev[screenKey],
    }));
  };

  /* ================= UI COMPONENTS ================= */
  const NavItem = ({ label, to, iconKey, active, onClick, level = 0, hasChildren = false, isExpanded = false, onToggle }) => {
    const IconComp = ICON[iconKey] || UserIcon;

    return (
      <Box
        as={onClick ? "button" : NavLink}
        to={onClick ? undefined : to}
        w="full"
        onClick={onClick}
        style={{ textDecoration: "none" }}
      >
        <Flex
          align="center"
          justify="space-between"
          gap="12px"
          px={isCollapsed ? 3 : 4}
          py="10px"
          mx={isCollapsed ? 2 : 3}
          rounded="xl"
          bg={
            active && level === 0
              ? itemActiveBg
              : active && level > 0
                ? childActiveBg
                : "transparent"
          }
          boxShadow={active && level === 0 ? itemActiveShadow : "none"}
          _hover={{
            bg:
              active && level === 0
                ? itemActiveBg
                : active && level > 0
                  ? childActiveBg
                  : level > 0
                    ? childHoverBg
                    : itemHoverBg,
          }}
          pl={level ? 10 : undefined}
          cursor="pointer"
          transition="all 0.2s"
        >
          <Flex align="center" gap="12px" flex={1}>
            {iconKey && level === 0 && (
              <Box w="36px" h="36px" display="grid" placeItems="center">
                <Icon as={IconComp} boxSize="5" color="white" />
              </Box>
            )}
            {!isCollapsed && (
              <Text
                fontSize={level > 0 ? "xs" : "sm"}
                fontWeight={level > 0 ? 500 : 600}
                color="white"
              >
                {label}
              </Text>
            )}
          </Flex>

          {hasChildren && !isCollapsed && (
            <Icon
              as={ChevronDownIcon}
              boxSize="4"
              color={muted}
              transform={isExpanded ? "rotate(0deg)" : "rotate(-90deg)"}
              transition="transform 0.2s"
            />
          )}
        </Flex>
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

  /* ================= SIDEBAR CONTENT ================= */
  const SidebarContent = () => (
    <Box
      bg={sidebarBg}
      h="100vh"
      w={isCollapsed ? "84px" : "290px"}
      borderRight="1px solid"
      borderColor={sidebarBorder}
      display="flex"
      flexDirection="column"
      transition="width 0.3s"
    >
      {/* LOGO */}
      <Flex align="center" justify="space-between" px={6} py={4}>
        <HStack>
          <Image src="/vite.svg" w="18px" fallbackSrc={FALLBACK_18} />
          {!isCollapsed && (
            <Text color="white" fontWeight="800">
              JOYGREEN
            </Text>
          )}
        </HStack>
        <IconButton
          size="sm"
          variant="ghost"
          icon={isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          onClick={() => setIsCollapsed((v) => !v)}
        />
      </Flex>

      <Divider borderColor={sidebarBorder} />

      {/* MENU */}
      <Box flex="1" overflowY="auto">
        {dashboardScreen && (
          <VStack align="stretch" py={3}>
            <NavItem
              label={dashboardScreen.label}
              to={dashboardScreen.routes?.[0]}
              iconKey={dashboardScreen.icon || "home"}
              active={isActiveRoute(dashboardScreen.routes, pathname)}
            />
          </VStack>
        )}

        {groups.map((g) => {
          const list = byGroup[g.key] || [];
          if (!list.length) return null;

          return (
            <Box key={g.key}>
              <SectionTitle>{g.label}</SectionTitle>

              {list.map((s) => {
                const isExpanded = expandedGroups[s.key] || false;
                const hasChildren = s._children && s._children.length > 0;
                const childActive = s._children?.some((c) =>
                  isActiveRoute(c.routes, pathname)
                );
                const parentActive = isActiveRoute(s.routes, pathname);

                return (
                  <Box key={s.key}>
                    {/* PARENT */}
                    <Box
                      onClick={
                        hasChildren
                          ? () => toggleExpand(s.key)
                          : undefined
                      }
                    >
                      <NavItem
                        label={s.label}
                        to={hasChildren ? undefined : s.routes?.[0]}
                        iconKey={s.icon}
                        active={parentActive}
                        hasChildren={hasChildren}
                        isExpanded={isExpanded}
                        level={0}
                      />
                    </Box>

                    {/* CHILDREN */}
                    {!isCollapsed && hasChildren && (
                      <Collapse in={isExpanded} animateOpacity>
                        <VStack
                          align="stretch"
                          spacing={1}
                          mt={1}
                          pl={2}
                          borderLeft="2px solid"
                          borderColor="rgba(79,124,255,0.3)"
                        >
                          {s._children?.map((c) => {
                            const isChildActive = isActiveRoute(c.routes, pathname);
                            return (
                              <NavItem
                                key={c.key}
                                label={c.label}
                                to={c.routes?.[0]}
                                active={isChildActive}
                                level={1}
                              />
                            );
                          })}
                        </VStack>
                      </Collapse>
                    )}
                  </Box>
                );
              })}
            </Box>
          );
        })}

        <NavItem label="Logout" iconKey="logout" onClick={handleLogout} />
      </Box>

      <Divider borderColor={sidebarBorder} />

      {/* USER */}
      <Box p={4}>
        <Flex align="center" gap={3}>
          <Avatar size="sm" name={user?.fullName} />
          {!isCollapsed && (
            <Box>
              <Text color="white" fontSize="sm">
                {user?.fullName}
              </Text>
              <Text color={muted} fontSize="xs">
                {user?.email}
              </Text>
            </Box>
          )}
        </Flex>
      </Box>
    </Box>
  );

  /* ================= RENDER ================= */
  return (
    <>
      {isMobile && (
        <IconButton
          icon={<Bars3Icon />}
          position="fixed"
          top="14px"
          left="14px"
          onClick={onOpen}
          zIndex={100}
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