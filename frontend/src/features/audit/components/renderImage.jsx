import {
  Box,
 
  Text,
 
} from '@chakra-ui/react';

export const renderImages = (images = []) => {
  if (!Array.isArray(images) || images.length === 0) {
    return (
      <p className="text-slate-500 text-sm">Không có ảnh</p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {images.map((img, idx) => (
        <div
          key={idx}
          className="border rounded-lg overflow-hidden bg-white shadow-sm"
        >
          <img
            src={img.url}
            alt=""
            className="w-full h-32 object-cover"
          />
        </div>
      ))}
    </div>
  );
};

export const renderUserAgent = (audit) => {
  // Fallback: chưa parse hoặc không có
  if (!audit?.userAgent) {
    return (
      <p className="text-slate-700 text-xs break-all font-mono whitespace-pre-wrap">
        {typeof audit?.userAgent === "string"
          ? audit.userAgent
          : audit?.userAgent
          ? JSON.stringify(audit.userAgent, null, 2)
          : "—"}
      </p>
    );
  }

  const { browser, os, device } = audit.userAgent;

  return (
  <Box fontSize="xs" fontFamily="mono" color="gray.700">
    <Text>🌐 {browser?.name} {browser?.version}</Text>
    <Text>🖥 {os?.name} {os?.version}</Text>
    <Text>💻 {device?.type || "desktop"}</Text>
  </Box>
);

};

