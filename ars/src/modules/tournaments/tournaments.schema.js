const { z } = require('zod');

const createTournamentSchema = z.object({
  name: z.string().min(2).max(200),
  game: z.string().min(1).max(100),
  start_date: z.string().datetime().optional(),
});

const updateTournamentSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  game: z.string().min(1).max(100).optional(),
  start_date: z.string().datetime().optional(),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional(),
});

const registerTeamSchema = z.object({ team_id: z.string().uuid() });
const updateRegistrationSchema = z.object({ status: z.enum(['approved', 'rejected']) });

module.exports = { createTournamentSchema, updateTournamentSchema, registerTeamSchema, updateRegistrationSchema };
