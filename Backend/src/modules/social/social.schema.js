const { z } = require('zod');

const followSchema = z.object({
  target_type: z.enum(['org', 'team']),
  target_id: z.string().uuid(),
});

const createPostSchema = z.object({
  content: z.string().min(1).max(5000),
});

module.exports = { followSchema, createPostSchema };
