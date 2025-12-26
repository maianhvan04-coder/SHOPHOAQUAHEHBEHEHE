import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Alert,
  AlertIcon,
  useColorModeValue,
  Card,
  CardBody,
  Heading,
  Text,
  Collapse,
  IconButton,
  useDisclosure,
  InputGroup,
  InputRightElement,
  Divider,
} from "@chakra-ui/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { XMarkIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useColorMode } from "@chakra-ui/react";

// ✅ dùng hook login chuẩn
import { useLogin } from "~/features/auth/hooks/useLogin";

function Login() {
  const {
    form,
    fieldErrors,
    error,
    loading,
    onChange,
    onSubmit,
  } = useLogin();

  const [showPassword, setShowPassword] = useState(false);

  const textColor = useColorModeValue("gray.600", "gray.400");
  const alertBg = useColorModeValue("vrv.50", "rgba(48, 73, 69, 0.2)");
  const alertColor = useColorModeValue("vrv.700", "vrv.200");
  const alertIconColor = useColorModeValue("vrv.500", "vrv.200");

  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });
  const { colorMode, toggleColorMode } = useColorMode();

  const rightSideGradient = `
    radial-gradient(49% 81% at 45% 47%, rgba(26, 42, 40, 0.37) 0%, rgba(16, 24, 23, 0) 100%),
    radial-gradient(113% 91% at 17% -2%, rgba(44, 82, 75, 1) 1%, rgba(16, 24, 23, 0) 99%),
    radial-gradient(142% 91% at 83% 7%, rgba(39, 63, 59, 0.8) 1%, rgba(16, 24, 23, 0) 99%),
    radial-gradient(142% 91% at -6% 74%, rgba(28, 48, 44, 1) 1%, rgba(16, 24, 23, 0) 99%),
    radial-gradient(142% 91% at 111% 84%, rgba(44, 82, 75, 0.8) 0%, rgba(16, 24, 23, 1) 100%)
  `;

  return (
    <Box h="100vh" w="100vw" display="flex" overflow="hidden" position="relative">
      {/* Toggle dark mode */}
      <IconButton
        aria-label="Toggle dark mode"
        icon={colorMode === "dark" ? <SunIcon /> : <MoonIcon />}
        onClick={toggleColorMode}
        position="absolute"
        top={4}
        right={4}
        zIndex={2}
        size="lg"
        borderRadius="full"
        bg={useColorModeValue("white", "gray.800")}
      />

      {/* LEFT */}
      <Box
        display={{ base: "none", lg: "flex" }}
        w="50%"
        h="100%"
        bg={useColorModeValue("#ffffff", "gray.800")}
        alignItems="center"
        justifyContent="center"
        p={10}
      >
        <Box maxW="480px" textAlign="center">
          <img
            src="/vite.svg"
            alt="VRV Logo"
            style={{ width: 120, margin: "0 auto 2rem" }}
          />
          <Heading size="2xl" mb={6}>
            Welcome to VRV Security
          </Heading>
          <Divider />
          <Text mt={8} fontSize="lg" color={textColor}>
            Demo RBAC system.
            <br />
            Github:{" "}
            <Link
              onClick={() =>
                window.open("https://github.com/Deeptanshuu/VRV", "_blank")
              }
              style={{ color: "#2c524b" }}
            >
              Project Link
            </Link>
          </Text>
        </Box>
      </Box>

      {/* RIGHT */}
      <Box
        w={{ base: "100%", lg: "50%" }}
        h="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          backgroundImage: rightSideGradient,
        }}
      >
        <Card w={{ base: "full", md: "520px" }} p={8}>
          <CardBody>
            <Stack spacing={6}>
              <Box textAlign="center">
                <Heading size="xl" mb={2}>
                  Welcome Back
                </Heading>
                <Text color={textColor}>Sign in to your account</Text>
              </Box>

              <Collapse in={isOpen}>
                <Alert
                  status="info"
                  variant="subtle"
                  bg={alertBg}
                  color={alertColor}
                >
                  <AlertIcon color={alertIconColor} />
                  Demo account
                  <IconButton
                    icon={<XMarkIcon className="h-4 w-4" />}
                    size="sm"
                    variant="ghost"
                    ml="auto"
                    onClick={onToggle}
                  />
                </Alert>
              </Collapse>

              {error && (
                <Alert status="error">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              {/* ✅ FORM dùng useLogin */}
              <form onSubmit={onSubmit}>
                <Stack spacing={5}>
                  <FormControl isRequired isInvalid={!!fieldErrors.email}>
                    <FormLabel>Email</FormLabel>
                    <Input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={onChange}
                      placeholder="Enter your email"
                    />
                  </FormControl>

                  <FormControl isRequired isInvalid={!!fieldErrors.password}>
                    <FormLabel>Password</FormLabel>
                    <InputGroup>
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={onChange}
                        placeholder="Enter your password"
                      />
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          icon={
                            showPassword ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )
                          }
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="vrv"
                    size="lg"
                    isLoading={loading}
                  >
                    Sign In
                  </Button>
                </Stack>
              </form>
            </Stack>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}

export default Login;
