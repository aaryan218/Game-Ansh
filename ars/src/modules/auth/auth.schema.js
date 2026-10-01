const { z } = require('zod');

const playerSignupSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  game_ign: z.string().max(100).optional(),
});

const orgSignupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

const organizerSignupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(['player', 'org', 'organizer', 'admin']),
});

module.exports = { playerSignupSchema, orgSignupSchema, organizerSignupSchema, loginSchema };
