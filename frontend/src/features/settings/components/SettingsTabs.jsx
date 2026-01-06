import { Box, TabPanels, TabPanel, Tabs, useColorModeValue } from "@chakra-ui/react";
import PropTypes from "prop-types";
import SettingsTabNav from "./SettingsTabNav";

import ProfilePanel from "./panels/ProfilePanel";
import SecurityPanel from "./panels/SecurityPanel";
import NotificationsPanel from "./panels/NotificationsPanel";
import AppearancePanel from "./panels/AppearancePanel";

export default function SettingsTabs(props) {
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Box>
      <Box maxW="1200px" mx="auto">
        <Tabs variant="unstyled" defaultIndex={0}>
          <SettingsTabNav borderColor={borderColor} />

        <TabPanels>
  <TabPanel px={0}>
    <ProfilePanel
      user={props.user}
      photoURL={props.photoURL}
      uploadingAvatar={props.uploadingAvatar}
      fileInputRef={props.fileInputRef}
      onUploadClick={props.onUploadClick}
      onFileChange={props.onFileChange}
      formData={props.formData}
      onChange={props.onChange}
      onSubmitProfile={props.onSubmitProfile}
      savingProfile={props.savingProfile}
    />
  </TabPanel>

  <TabPanel px={0}>
    <SecurityPanel
      formData={props.formData}
      onChange={props.onChange}
      onSubmitPassword={props.onSubmitPassword}
      showPassword={props.showPassword}
      setShowPassword={props.setShowPassword}
      savingPassword={props.savingPassword}
    />
  </TabPanel>

  <TabPanel px={0}>
    <NotificationsPanel
      notifications={props.formData?.notifications}
      onToggleNotification={props.onToggleNotification}
    />
  </TabPanel>

  <TabPanel px={0}>
    <AppearancePanel
      colorMode={props.colorMode}
      toggleColorMode={props.toggleColorMode}
    />
  </TabPanel>
</TabPanels>

        </Tabs>
      </Box>
    </Box>
  );
}

SettingsTabs.propTypes = {
  colorMode: PropTypes.string.isRequired,
  toggleColorMode: PropTypes.func.isRequired,
  user: PropTypes.any,

  formData: PropTypes.object.isRequired,
  showPassword: PropTypes.bool.isRequired,
  setShowPassword: PropTypes.func.isRequired,
  photoURL: PropTypes.any,
  fileInputRef: PropTypes.any,

  onChange: PropTypes.func.isRequired,
  onToggleNotification: PropTypes.func.isRequired,
  onSubmitProfile: PropTypes.func.isRequired,
  onSubmitPassword: PropTypes.func.isRequired,
  onUploadClick: PropTypes.func.isRequired,
  onFileChange: PropTypes.func.isRequired,
  onRemovePhoto: PropTypes.func.isRequired,
  colorScheme: PropTypes.string,
};
