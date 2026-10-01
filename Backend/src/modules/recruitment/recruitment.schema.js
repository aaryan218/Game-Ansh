const { z } = require('zod');

const createPostingSchema = z.object({
  role: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
});

const updateApplicationSchema = z.object({
  status: z.enum(['shortlisted', 'accepted', 'rejected']),

});

module.exports = { createPostingSchema, updateApplicationSchema };
