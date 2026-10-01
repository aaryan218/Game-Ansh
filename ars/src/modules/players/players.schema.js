const { z } = require('zod');

const updatePlayerSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  game_ign: z.string().max(100).optional(),
});

module.exports = { updatePlayerSchema };
