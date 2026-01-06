import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import PropTypes from "prop-types";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const hoverTransition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

export default function SecurityPanel({
  formData,
  onChange,
  onSubmitPassword,
  showPassword,
  setShowPassword,
}) {
  const cardBg = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const subTextColor = useColorModeValue("gray.600", "gray.400");

  return (
    <form onSubmit={onSubmitPassword}>
      <VStack spacing={8} align="start" w="full">
        <Box>
          <Text fontSize="xl" fontWeight="bold" mb={2}>
            🔐 Đổi mật khẩu
          </Text>
          <Text fontSize="sm" color={subTextColor}>
            Cập nhật mật khẩu thường xuyên để bảo vệ tài khoản của bạn
          </Text>
        </Box>

        <Card
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="xl"
          shadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
          w="full"
          overflow="hidden"
        >
          <Box h="2px" bgGradient="linear(to-r, red.400, orange.400, red.500)" />
          <CardBody>
            <Stack spacing={6}>
              <FormControl>
                <FormLabel fontWeight="600" mb={2}>
                  Mật khẩu hiện tại
                </FormLabel>
                <InputGroup>
                  <Input
                    name="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={onChange}
                    bg={inputBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="lg"
                    px={4}
                    py={2.5}
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.5)",
                      bg: cardBg,
                    }}
                  />
                  <InputRightElement cursor="pointer" pr={3}>
                    <Icon
                      as={showPassword ? EyeSlashIcon : EyeIcon}
                      onClick={() => setShowPassword((v) => !v)}
                      boxSize={5}
                      color={subTextColor}
                      transition={hoverTransition}
                      _hover={{ color: "blue.500" }}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="600" mb={2}>
                  Mật khẩu mới
                </FormLabel>
                <Input
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={onChange}
                  bg={inputBg}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="lg"
                  px={4}
                  py={2.5}
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.5)",
                    bg: cardBg,
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="600" mb={2}>
                  Xác nhận mật khẩu mới
                </FormLabel>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={onChange}
                  bg={inputBg}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="lg"
                  px={4}
                  py={2.5}
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.5)",
                    bg: cardBg,
                  }}
                />
              </FormControl>
            </Stack>

            <HStack spacing={4} mt={8}>
              <Button
                type="submit"
                bgGradient="linear(to-r, blue.500, cyan.400)"
                color="white"
                fontWeight="bold"
                transition={hoverTransition}
                _hover={{
                  bgGradient: "linear(to-r, blue.600, cyan.500)",
                  transform: "translateY(-2px)",
                  shadow: "0 8px 20px -4px rgba(59, 130, 246, 0.4)",
                }}
              >
                Cập nhật mật khẩu
              </Button>

              <Button variant="outline" colorScheme="red" fontWeight="bold">
                Xóa tài khoản
              </Button>
            </HStack>
          </CardBody>
        </Card>
      </VStack>
    </form>
  );
}

SecurityPanel.propTypes = {
  formData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmitPassword: PropTypes.func.isRequired,
  showPassword: PropTypes.bool.isRequired,
  setShowPassword: PropTypes.func.isRequired,
};
