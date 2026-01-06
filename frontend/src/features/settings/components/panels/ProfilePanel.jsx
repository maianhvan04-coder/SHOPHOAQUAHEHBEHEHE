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
  SimpleGrid,
  Text,
  VStack,
  Avatar,
  useColorModeValue,
} from "@chakra-ui/react";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

const hoverTransition = "all 0.2s ease";

export default function ProfilePanel({
  user,
  photoURL,
  uploadingAvatar,
  fileInputRef,
  onUploadClick,
  onFileChange,

  formData,
  onChange,
  onSubmitProfile,
  savingProfile,
}) {
  const cardBg = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const subTextColor = useColorModeValue("gray.600", "gray.400");

  return (
    <form onSubmit={onSubmitProfile}>
      <VStack spacing={6} align="start">
        {/* Avatar */}
        <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl" w="full">
          <CardBody>
            <HStack spacing={6} align="flex-start">
             

   <Box position="relative" display="inline-flex" alignItems="center" justifyContent="center">
  {/* Glow phía sau (không ảnh hưởng ảnh) */}
  <Box
    position="absolute"
    inset="-10px"
    bgGradient="linear(to-br, blue.400, cyan.400)"
    filter="blur(18px)"
    opacity={0.35}
    borderRadius="full"
    zIndex={0}
    pointerEvents="none"
  />

  {/* Ring ngoài */}
  <Box
    position="relative"
    p="3px"
    borderRadius="full"
    bg="white"
    boxShadow="0 10px 30px rgba(0,0,0,0.18)"
    zIndex={1}
  >
    <Avatar
      name={user?.fullName || user?.name}
      src={photoURL || user?.image?.url || ""}
      size="2xl"
    
      w="124px"
      h="124px"
      
      objectFit="cover"
     
      sx={{
        img: {
          objectFit: "cover",
          imageRendering: "auto",
        },
      }}
      border="0"
      bg="gray.100"
    />
  </Box>
</Box>


              <VStack align="start" spacing={2} flex={1}>
                <Box>
                  <Text fontSize="lg" fontWeight="700">
                    Ảnh đại diện
                  </Text>
                
                </Box>

                <HStack>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileChange}
                    accept="image/*"
                    style={{ display: "none" }}
                  />

                  <Button
                    size="sm"
                    leftIcon={<Icon as={CloudArrowUpIcon} boxSize={4} />}
                    onClick={onUploadClick}
                    isLoading={uploadingAvatar}
                    loadingText="Đang tải..."
                    bgGradient="linear(to-r, blue.500, cyan.400)"
                    color="white"
                    transition={hoverTransition}
                    _hover={{ transform: "translateY(-1px)" }}
                  >
                    Tải lên
                  </Button>
                </HStack>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Form */}
        <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl" w="full">
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} w="full">
              <FormControl>
                <FormLabel fontWeight="600">Họ và tên</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                  bg={inputBg}
                  borderColor={borderColor}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="600">Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={onChange}
                  bg={inputBg}
                  borderColor={borderColor}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="600">Số điện thoại</FormLabel>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={onChange}
                  bg={inputBg}
                  borderColor={borderColor}
                />
              </FormControl>

            
            </SimpleGrid>

            <Button
              mt={6}
              type="submit"
              isLoading={savingProfile}
              bgGradient="linear(to-r, blue.500, cyan.400)"
              color="white"         
              _hover={{ transform: "translateY(-1px)" }}
            >
              Lưu thay đổi
            </Button>
          </CardBody>
        </Card>
      </VStack>
    </form>
  );
}
