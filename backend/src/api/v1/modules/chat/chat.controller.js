const chatService = require("./chat.service");

exports.chat = (req, res) => {
  const { message, sessionId } = req.body;
  const { reply } = chatService.replyChat({ message, sessionId });
  return res.json({ data: { reply } });
};
