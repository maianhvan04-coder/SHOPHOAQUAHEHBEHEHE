import { Box, Card, CardBody, useColorMode, useColorModeValue } from "@chakra-ui/react";
import PageHeader from "~/components/layout/admin/PageHeader";

import { authStorage } from "~/features/auth/authStorage";
import { useSettingsForm } from "~/features/settings/hooks/useSettingsForm";
import SettingsTabs from "~/features/settings/components/SettingsTabs";

import { useAvatarUpload } from "~/features/settings/hooks/useAvatarUpload";    

export default function Settings() {
  const { colorMode, toggleColorMode } = useColorMode();

  const me = authStorage.getMe();
  const user = me?.user || {};

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");

  // ✅ form hook
  const {
    formData,
    showPassword,
    setShowPassword,
    savingProfile,
    savingPassword,
    onChange,
    onToggleNotification,
    onSubmitProfile,
    onSubmitPassword,
  } = useSettingsForm(me);

  // ✅ avatar hook (tách riêng đúng mục đích)
  const {
    photoURL,
    uploadingAvatar,
    fileInputRef,
    onUploadClick,
    onFileChange,
  } = useAvatarUpload();

  return (
    <Box p={8}>
      <PageHeader title="Settings" description="Manage your account settings and preferences" />

      <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <SettingsTabs
            colorMode={colorMode}
            toggleColorMode={toggleColorMode}
            user={user}
            textColor={textColor}
            formData={formData}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            photoURL={photoURL}
            uploadingAvatar={uploadingAvatar}
            fileInputRef={fileInputRef}
            onUploadClick={onUploadClick}
            onFileChange={onFileChange}
            onChange={onChange} // ✅ đúng tên
            onToggleNotification={onToggleNotification} // ✅ đúng tên
            onSubmitProfile={onSubmitProfile} // ✅ đúng tên
            onSubmitPassword={onSubmitPassword} // ✅ đúng tên
            savingProfile={savingProfile}
            savingPassword={savingPassword}
            colorScheme="blue"
          />
        </CardBody>
      </Card>
    </Box>
  );
}
