/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { canAccessScreen } from "~/shared/utils/ability";
import { matchRoute } from "~/shared/utils/ability";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "~/app/providers/AuthProvides";

import {
  Box,
  VStack,
  Flex,
  Text,
  Icon,
  Image,
  Divider,
  useColorModeValue,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerCloseButton,
  IconButton,
  useDisclosure,
  Tooltip,
  Center,
  useBreakpointValue,
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
} from "@heroicons/react/24/outline";

import { authService } from "../../features/auth/authService";

// icon string -> component (tùy data bạn)
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
};



export default function Sidebar({ groups, screens, userPermissions = [] }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isMobile = useBreakpointValue({ base: true, md: false });

  const bgColor = useColorModeValue("#304945", "#243634");
  const borderColor = useColorModeValue("white", "gray.700");
  const activeItemBg = useColorModeValue("#405d58", "#3d5b56");
  const hoverBg = useColorModeValue("#405d58", "#3d5b56");
  const secondaryTextColor = useColorModeValue("gray.100", "gray.400");

  const byGroup = useMemo(() => {
    const allowedScreens = (screens || []).filter((s) =>
      canAccessScreen(userPermissions, s)
    );

    
    const map = {};
    allowedScreens.forEach((s) => {
      const gkey = s.group; // expect: screen.group = group.key
      map[gkey] = map[gkey] || [];
      map[gkey].push(s);
    });

    // optional sort nếu có field order
    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    });

    return map;
  }, [screens, userPermissions]);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const NavItem = ({ label, to, iconKey, onClick, onItemClose }) => {
    const active = to ? matchRoute(to, pathname) : false;
    const IconComp = (iconKey && ICON[iconKey]) || UserIcon;

    const content = (
      <Flex
        align="center"
        px="4"
        py="3"
        m={isCollapsed ? "3" : "0"}
        rounded="xl"
        transition="all 0.2s ease-in-out"
        bg={active ? activeItemBg : "transparent"}
        _hover={{ bg: hoverBg }}
        position="relative"
        w="full"
      >
        {active && (
          <Box
            position="absolute"
            left="0"
            top="50%"
            transform="translateY(-50%)"
            width="4px"
            height="70%"
            bg="white"
            borderRadius="full"
          />
        )}

        <Icon as={IconComp} boxSize="5" color="white" />
        {!isCollapsed && (
          <Text ml="3" fontSize="sm" fontWeight="medium" color="white">
            {label}
          </Text>
        )}
      </Flex>
    );

    if (onClick) {
      return (
        <Tooltip label={isCollapsed ? label : ""} placement="right">
          <Box
            as="button"
            w="full"
            textAlign="left"
            onClick={() => {
              onClick();
              onItemClose?.();
            }}
          >
            {content}
          </Box>
        </Tooltip>
      );
    }

    return (
      <Tooltip label={isCollapsed ? label : ""} placement="right">
        <Box
          as={NavLink}
          to={to || "#"}
          w="full"
          onClick={() => onItemClose?.()}
          style={{ textDecoration: "none" }}
        >
          {content}
        </Box>
      </Tooltip>
    );
  };

  const SidebarContent = ({ onDrawerClose }) => (
    <Box
      bg={bgColor}
      color="white"
      h="full"
      py="5"
      position="relative"
      transition="all 0.3s ease-in-out"
      w={isCollapsed ? "20" : "64"}
    >
      {/* Collapse Toggle (desktop only) */}
      <IconButton
        icon={
          isCollapsed ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5" />
          )
        }
        position="absolute"
        right="-5"
        top="50%"
        transform="translateY(-50%)"
        size="md"
        rounded="full"
        border="1px solid"
        borderColor={bgColor}
        display={{ base: "none", md: "flex" }}
        onClick={() => setIsCollapsed((v) => !v)}
        aria-label={isCollapsed ? "Expand" : "Collapse"}
        zIndex="10"
        _hover={{ transform: "translateY(-50%) scale(1.08)", boxShadow: "lg" }}
      />

      <Flex direction="column" h="full">
        {/* Logo */}
        <Flex align="center" px="6" mb="6" overflow="hidden">
          <Image
            h="12"
            w="auto"
            src="/vite.svg"
            alt="Logo"
            fallbackSrc="https://via.placeholder.com/36"
          />
          {!isCollapsed && (
            <Box ml="3">
              <Text fontSize="lg" fontWeight="bold" letterSpacing="tight">
                VRV Security
              </Text>
              <Text fontSize="xs" opacity="0.7">
                Role Management System
              </Text>
            </Box>
          )}
        </Flex>

        {/* Groups + Screens */}
        <VStack spacing="2" align="stretch" flex="1" px={isCollapsed ? 0 : 2}>
          {(groups || []).map((g) => {
            const list = byGroup[g.key] || [];
            if (!list.length) return null;

            return (
              <Box key={g.key}>
                {!isCollapsed && (
                  <Text
                    px="4"
                    fontSize="xs"
                    color={secondaryTextColor}
                    textTransform="uppercase"
                    letterSpacing="wider"
                    mb="2"
                    mt="2"
                  >
                    {g.label || g.name || g.key}
                  </Text>
                )}

                <VStack spacing="1" align="stretch">
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

          {/* System */}
          <Box mt="auto">
            <Divider
              my="4"
              borderColor={borderColor}
              opacity="0.3"
              display={{ base: "none", md: "block" }}
            />

            {!isCollapsed && (
              <Text
                px="4"
                fontSize="xs"
                color={secondaryTextColor}
                textTransform="uppercase"
                letterSpacing="wider"
                mb="2"
              >
                System
              </Text>
            )}

            <NavItem label="Settings" to="/settings" iconKey="settings" onItemClose={onDrawerClose} />
            <NavItem label="Logout" iconKey="logout" onClick={handleLogout} onItemClose={onDrawerClose} />
          </Box>
        </VStack>

        {/* User Section */}
        <Box px="4" mt="4">
          <Tooltip label={isCollapsed ? `${user?.name || "Unknown User"}` : ""} placement="right">
            <Flex p="3" rounded="xl" bg={activeItemBg} align="center" _hover={{ bg: hoverBg }}>
              <Center w="8" h="8" rounded="lg" bg={hoverBg} fontSize="sm" fontWeight="bold">
                {user?.name?.charAt(0) || "?"}
              </Center>

              {!isCollapsed && (
                <Box ml="3" flex="1">
                  <Text fontSize="sm" fontWeight="medium">
                    {user?.name || "Unknown"}
                  </Text>
                  <Text fontSize="xs" opacity="0.7">
                    {user?.email || "no@email.com"}
                  </Text>
                </Box>
              )}
            </Flex>
          </Tooltip>
        </Box>
      </Flex>
    </Box>
  );

  const MobileMenuButton = () => (
    <IconButton
      display={{ base: "flex", md: "none" }}
      onClick={onOpen}
      variant="ghost"
      position="fixed"
      top="4"
      left="4"
      zIndex={10}
      icon={<Bars3Icon className="h-6 w-6" />}
      aria-label="Open menu"
      color="white"
      _hover={{ bg: "whiteAlpha.200" }}
    />
  );

  return (
    <>
      <MobileMenuButton />

      {/* Desktop */}
      <Box
        as="aside"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        w={isCollapsed ? "20" : "64"}
        display={{ base: "none", md: "block" }}
      >
        <SidebarContent />
      </Box>

      {/* Mobile */}
      <Box display={{ base: "block", md: "none" }}>
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent bg={bgColor} w="80vw" maxW="80vw">
            <DrawerCloseButton color="white" />
            <SidebarContent onDrawerClose={onClose} />
          </DrawerContent>
        </Drawer>
      </Box>
    </>
  );
}
