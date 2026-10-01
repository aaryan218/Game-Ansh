const { z } = require('zod');

const createTeamSchema = z.object({
  name: z.string().min(2).max(100),
  game: z.string().min(1).max(100),
});

const addPlayerSchema = z.object({
  player_id: z.string().uuid(),
});

module.exports = { createTeamSchema, addPlayerSchema };
