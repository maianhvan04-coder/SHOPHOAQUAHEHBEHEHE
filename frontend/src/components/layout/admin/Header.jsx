import { useState } from "react";
import {
  Box,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  HStack,
  useColorMode,
  useColorModeValue,
  Tooltip,
  Divider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  Stack,
  Circle,
  Avatar,
  Badge,
  chakra,
  Portal 
} from "@chakra-ui/react";
import {
  BellIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../../features/auth/authService";
import { useAuth } from "~/app/providers/AuthProvides";

const HeroIcon = chakra("span", {
  baseStyle: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();

  // === Modern dark header ===
  const headerBg = useColorModeValue("#0F172A", "#0B1220"); // slate-950-ish
  const headerBorder = useColorModeValue("whiteAlpha.200", "whiteAlpha.200");

  const iconBtnHover = useColorModeValue("whiteAlpha.200", "whiteAlpha.200");
  const iconBtnActive = useColorModeValue("whiteAlpha.300", "whiteAlpha.300");

  const panelBg = useColorModeValue("rgba(17, 24, 39, 0.92)", "rgba(17, 24, 39, 0.92)");
  const panelBorder = useColorModeValue("whiteAlpha.200", "whiteAlpha.200");

  const subtleText = useColorModeValue("whiteAlpha.700", "whiteAlpha.700");
  const strongText = useColorModeValue("whiteAlpha.900", "whiteAlpha.900");

  const menuItemHover = useColorModeValue("whiteAlpha.120", "whiteAlpha.120");

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  // Mock notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New User Added",
      description: "John Doe has been added to the system",
      time: "2 min ago",
      isRead: false,
      type: "user",
    },
    {
      id: 2,
      title: "Role Updated",
      description: "Manager role permissions have been modified",
      time: "1 hour ago",
      isRead: false,
      type: "role",
    },
    {
      id: 3,
      title: "System Update",
      description: "System maintenance scheduled for tomorrow",
      time: "2 hours ago",
      isRead: true,
      type: "system",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => setNotifications([]);

  return (
    <Box
      bg={headerBg}
      borderBottom="1px solid"
      borderColor={headerBorder}
      position="sticky"
      top={0}
      zIndex={20}

      backdropFilter="blur(10px)"
    >
      <Flex h={16} align="center" justify="space-between" px={{ base: 3, md: 5 }}>
        {/* Left */}
        <Flex align="center" gap={3} minW={0}>
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="700"
            color={strongText}
            letterSpacing="-0.02em"
            noOfLines={1}
          >
            Dashboard
          </Text>
          <Badge
            display={{ base: "none", md: "inline-flex" }}
            bg="whiteAlpha.100"
            color="whiteAlpha.800"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="full"
            px={3}
            py={1}
            fontWeight="600"
            fontSize="xs"
          >
            Admin
          </Badge>
        </Flex>

        {/* Right */}
        <HStack spacing={{ base: 1, md: 2 }}>
          {/* Theme */}
          <Tooltip
            label={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`}
            hasArrow
          >
            <IconButton
              aria-label="Toggle theme"
              variant="ghost"
              size="sm"
              color="whiteAlpha.900"
              _hover={{ bg: iconBtnHover }}
              _active={{ bg: iconBtnActive }}
              borderRadius="full"
              icon={
                colorMode === "light" ? (
                  <MoonIcon className="h-5 w-5" />
                ) : (
                  <SunIcon className="h-5 w-5" />
                )
              }
              onClick={toggleColorMode}
            />
          </Tooltip>

          {/* Notifications */}
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <Box position="relative">
                <IconButton
                  aria-label="Notifications"
                  variant="ghost"
                  size="sm"
                  color="whiteAlpha.900"
                  _hover={{ bg: iconBtnHover }}
                  _active={{ bg: iconBtnActive }}
                  borderRadius="full"
                  icon={<BellIcon className="h-5 w-5" />}
                />
                {unreadCount > 0 && (
                  <Circle
                    size="18px"
                    bg="red.500"
                    color="white"
                    position="absolute"
                    top="-1"
                    right="-1"
                    fontSize="10px"
                    fontWeight="800"
                    border="2px solid"
                    borderColor={headerBg}
                  >
                    {unreadCount}
                  </Circle>
                )}
              </Box>
            </PopoverTrigger>

          <Portal>
              <PopoverContent
             zIndex={2000}
      w={{ base: "92vw", sm: "360px" }}
      bg={panelBg}
      border="1px solid"
      borderColor={panelBorder}
      borderRadius="16px"
      overflow="hidden"
      boxShadow="0 20px 60px rgba(0,0,0,0.45)"
      _focus={{ boxShadow: "none" }}
            >
              <PopoverArrow bg={panelBg} />
              <PopoverHeader borderBottom="1px solid" borderColor="whiteAlpha.200" py={4}>
                <Flex justify="space-between" align="center">
                  <Text fontWeight="700" color={strongText}>
                    Notifications
                  </Text>
                  <HStack spacing={3}>
                    <Text
                      fontSize="sm"
                      color="cyan.300"
                      cursor="pointer"
                      onClick={markAllAsRead}
                      _hover={{ textDecoration: "underline" }}
                    >
                      Mark all
                    </Text>
                    <Text
                      fontSize="sm"
                      color="red.300"
                      cursor="pointer"
                      onClick={clearNotifications}
                      _hover={{ textDecoration: "underline" }}
                    >
                      Clear
                    </Text>
                  </HStack>
                </Flex>
              </PopoverHeader>

              <PopoverBody p={0}>
                <Stack spacing={0} maxH="380px" overflowY="auto">
                  {notifications.length === 0 ? (
                    <Box p={5} textAlign="center">
                      <Text color={subtleText}>No notifications</Text>
                    </Box>
                  ) : (
                    notifications.map((n) => (
                      <Box
                        key={n.id}
                        px={4}
                        py={3}
                        cursor="pointer"
                        borderBottom="1px solid"
                        borderColor="whiteAlpha.100"
                        bg={n.isRead ? "transparent" : "whiteAlpha.60"}
                        _hover={{ bg: "whiteAlpha.120" }}
                        transition="background 160ms ease"
                        onClick={() => handleNotificationClick(n.id)}
                      >
                        <Flex align="start" justify="space-between" gap={3}>
                          <Box>
                            <Text fontWeight="700" fontSize="sm" color={strongText}>
                              {n.title}
                            </Text>
                            <Text fontSize="sm" color={subtleText} mt={0.5}>
                              {n.description}
                            </Text>
                            <Text fontSize="xs" color="whiteAlpha.600" mt={1}>
                              {n.time}
                            </Text>
                          </Box>

                          {!n.isRead && (
                            <Circle size="8px" bg="cyan.300" mt={1.5} />
                          )}
                        </Flex>
                      </Box>
                    ))
                  )}
                </Stack>
              </PopoverBody>
            </PopoverContent>
          </Portal>
          </Popover>

          <Box w="1px" h="8" bg="whiteAlpha.200" display={{ base: "none", md: "block" }} />

          {/* User Menu */}
          <Menu placement="bottom-end">
            <MenuButton
              as={Flex}
              align="center"
              gap={3}
              cursor="pointer"
              px={2}
              py={1.5}
              borderRadius="14px"
              bg="whiteAlpha.80"
              _hover={{ bg: "whiteAlpha.120" }}
              transition="all 180ms ease"
            >
              <Avatar
                size="sm"
                name={user?.name || "Admin"}
                src={user?.avatarUrl || ""}
                bg="whiteAlpha.200"
              />
           
            </MenuButton>

            <MenuList
              bg={panelBg}
              border="1px solid"
              borderColor={panelBorder}
              borderRadius="16px"
              boxShadow="0 20px 60px rgba(0,0,0,0.45)"
              py={2}
              overflow="hidden"
              minW="240px"
            >
              <MenuItem
                as={Link}
                to="/admin/profile"
                bg="transparent"
                _hover={{ bg: menuItemHover }}
                color={strongText}
                py={3}
                icon={
                  <HeroIcon>
                    <UserIcon className="h-5 w-5" />
                  </HeroIcon>
                }
              >
                Profile
              </MenuItem>

              <MenuItem
                as={Link}
                to="/settings"
                bg="transparent"
                _hover={{ bg: menuItemHover }}
                color={strongText}
                py={3}
                icon={
                  <HeroIcon>
                    <Cog6ToothIcon className="h-5 w-5" />
                  </HeroIcon>
                }
              >
                Settings
              </MenuItem>

              <Box px={3} py={2}>
                <Divider borderColor="whiteAlpha.200" />
              </Box>

              <MenuItem
                bg="transparent"
                _hover={{ bg: "red.500", color: "white" }}
                color="red.300"
                py={3}
                onClick={handleLogout}
                icon={
                  <HeroIcon>
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                  </HeroIcon>
                }
              >
                Sign out
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
}

export default Header;
