const { z } = require('zod');
const sendMessageSchema = z.object({ content: z.string().min(1).max(10000) });
module.exports = { sendMessageSchema };
