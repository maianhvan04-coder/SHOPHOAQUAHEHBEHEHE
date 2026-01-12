import {
  Box,
  Card,
  CardBody,
  Stack,
  Avatar,
  Text,
  Badge,
  Divider,
  Button,
  useColorModeValue,
  SimpleGrid,
  VStack,
  Icon,
  HStack,
} from "@chakra-ui/react";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  KeyIcon,
  CalendarIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import PageHeader from "~/components/layout/admin/PageHeader";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useAuth } from "~/app/providers/AuthProvides";

import ProfileField from "~/features/profile/profileAdmin/components/ProfileField";
import { useProfileData } from "~/features/profile/profileAdmin/hooks/useProfileData";

function roleColorScheme(role) {
  const schemes = {
    Admin: "purple",
    Manager: "blue",
    User: "cyan",
  };
  return schemes[role] || "gray";
}

export default function Profile() {
  const {
    name,
    email,
    phone,

    role,
    avatarUrl,
    joinDateText,
    lastActiveText,
  } = useProfileData();
  const { user } = useAuth();

  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, cyan.50, blue.100)",
    "linear(to-br, gray.900, slate.800, gray.900)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const subTextColor = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("blue.100", "gray.700");
  const accentColor = useColorModeValue("blue.500", "cyan.400");

  const cardShadow = useColorModeValue(
    "0 10px 30px -5px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "0 10px 30px -5px rgba(34, 197, 211, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.3)"
  );

  const hoverTransition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

  return (
    <Box
      minH="100vh"
      bgGradient={bgGradient}
      p={{ base: 4, md: 8 }}
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgGradient: useColorModeValue(
          "radial(circle at 20% 50%, rgba(96, 165, 250, 0.1) 0%, transparent 50%)",
          "radial(circle at 20% 50%, rgba(34, 211, 238, 0.05) 0%, transparent 50%)"
        ),
        pointerEvents: "none",
      }}
    >
      <Box maxW="1200px" mx="auto" position="relative" zIndex={1}>
        <PageHeader
          title="Thông tin cá nhân"
          description="Quản lý thông tin tài khoản và thiết lập quyền hạn"
        />

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8} mt={8}>
          {/* CỘT 1: Profile Overview */}
          <Card
            bg={cardBg}
            shadow={cardShadow}
            borderRadius="2xl"
            border="1px solid"
            borderColor={borderColor}
            overflow="hidden"
            transition={hoverTransition}
            _hover={{
              shadow: `0 20px 50px -10px rgba(59, 130, 246, 0.2)`,
              transform: "translateY(-4px)",
            }}
            position="relative"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              bgGradient: "linear(to-r, blue.400, cyan.400, blue.500)",
            }}
          >
            <CardBody py={10}>
              <VStack spacing={5}>
                <Box
                  position="relative"
                  transition={hoverTransition}
                  _hover={{ transform: "scale(1.05)" }}
                >
                  <Box
                    position="absolute"
                    inset={0}
                    bgGradient="linear(to-br, blue.400, cyan.400)"
                    borderRadius="full"
                    blur="20px"
                    opacity={0.4}
                    zIndex={0}
                  />
                  <Avatar
                    size="2xl"
                    name={name}
                    src={avatarUrl}
                    border="4px solid"
                    borderColor={accentColor}
                    position="relative"
                    zIndex={1}
                    bg="linear-gradient(to-br, blue.400, cyan.400)"
                  />
                </Box>

                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight">
                    {name}
                  </Text>
                  <Badge
                    colorScheme={roleColorScheme(role)}
                    variant="gradient"
                    px={4}
                    py={2}
                    rounded="full"
                    fontSize="xs"
                    fontWeight="bold"
                    textTransform="uppercase"
                    boxShadow="0 4px 12px -2px rgba(59, 130, 246, 0.3)"
                  >
                    {role}
                  </Badge>
                </VStack>

                <Text color={subTextColor} fontSize="sm" textAlign="center">
                  {email}
                </Text>

                <Divider borderColor={borderColor} />

                <Link to="/settings" style={{ width: "100%" }}>
                  <Button
                    leftIcon={<Icon as={PencilSquareIcon} w={4} h={4} />}
                    bgGradient="linear(to-r, blue.500, cyan.400)"
                    color="white"
                    size="md"
                    width="full"
                    fontWeight="bold"
                    transition={hoverTransition}
                    _hover={{
                      bgGradient: "linear(to-r, blue.600, cyan.500)",
                      transform: "translateY(-2px)",
                      shadow: "0 8px 20px -4px rgba(59, 130, 246, 0.4)",
                    }}
                    _active={{ transform: "translateY(0)" }}
                  >
                    Chỉnh sửa hồ sơ
                  </Button>
                </Link>
                {user?.type === "internal" && (
                  <Button
                    leftIcon={<Icon as={ArrowLeftIcon} w={4} h={4} />}
                    variant="outline"
                    colorScheme="gray"
                    size="md"
                    width="full"
                    mt={3}
                    onClick={() => {
                      window.location.href = "/";
                    }}
                  >
                    Về trang Client
                  </Button>
                )}

              </VStack>
            </CardBody>
          </Card>

          {/* CỘT 2: Personal Information */}
          <Card
            bg={cardBg}
            shadow={cardShadow}
            borderRadius="2xl"
            border="1px solid"
            borderColor={borderColor}
            overflow="hidden"
            transition={hoverTransition}
            _hover={{
              shadow: `0 20px 50px -10px rgba(34, 211, 238, 0.2)`,
              transform: "translateY(-4px)",
            }}
            position="relative"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              bgGradient: "linear(to-r, cyan.400, blue.400, cyan.500)",
            }}
          >
            <CardBody>
              <HStack mb={6} spacing={3}>
                <Box
                  w={1}
                  h={8}
                  bgGradient="linear(to-b, cyan.400, blue.500)"
                  borderRadius="full"
                />
                <Text fontSize="lg" fontWeight="bold" color={accentColor}>
                  Thông Tin Liên Hệ
                </Text>
              </HStack>
              <Stack spacing={5}>
                <ProfileField icon={UserIcon} label="Họ và tên" value={name} />
                <Divider borderColor={borderColor} opacity={0.5} />
                <ProfileField icon={EnvelopeIcon} label="Email hệ thống" value={email} />
                <Divider borderColor={borderColor} opacity={0.5} />
                <ProfileField icon={PhoneIcon} label="Số điện thoại" value={phone} />
                <Divider borderColor={borderColor} opacity={0.5} />

              </Stack>
            </CardBody>
          </Card>

          {/* CỘT 3: Work Information */}
          <Card
            bg={cardBg}
            shadow={cardShadow}
            borderRadius="2xl"
            border="1px solid"
            borderColor={borderColor}
            overflow="hidden"
            transition={hoverTransition}
            _hover={{
              shadow: `0 20px 50px -10px rgba(59, 130, 246, 0.2)`,
              transform: "translateY(-4px)",
            }}
            position="relative"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              bgGradient: "linear(to-r, blue.500, purple.400, blue.400)",
            }}
          >
            <CardBody>
              <HStack mb={6} spacing={3}>
                <Box
                  w={1}
                  h={8}
                  bgGradient="linear(to-b, purple.400, blue.500)"
                  borderRadius="full"
                />
                <Text fontSize="lg" fontWeight="bold" color={accentColor}>
                  Công Việc
                </Text>
              </HStack>
              <Stack spacing={5}>
                <ProfileField icon={KeyIcon} label="Chức vụ" value={role} />
                <Divider borderColor={borderColor} opacity={0.5} />

                <Divider borderColor={borderColor} opacity={0.5} />
                <ProfileField icon={CalendarIcon} label="Ngày gia nhập" value={joinDateText} />

                <Box
                  mt={4}
                  p={4}
                  bgGradient={useColorModeValue(
                    "linear(to-br, blue.50, cyan.50)",
                    "linear(to-br, gray.700, gray.600)"
                  )}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={borderColor}
                  transition={hoverTransition}
                  _hover={{ shadow: "0 4px 12px -2px rgba(59, 130, 246, 0.2)" }}
                >
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color={subTextColor}
                    mb={2}
                    textTransform="uppercase"
                  >
                    ⏱️ Trạng thái hoạt động
                  </Text>
                  <Text fontSize="sm" fontWeight="medium" color={accentColor}>
                    Hoạt động lần cuối: {lastActiveText}
                  </Text>
                </Box>
              </Stack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>
    </Box>
  );
}