import { z } from 'zod';

const contentFields = {
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(2000).nullable().optional(),
};

export const createContentSchema = z.object(contentFields);
export type CreateContentDto = z.infer<typeof createContentSchema>;

export const updateContentSchema = z
  .object(contentFields)
  .partial()
  .refine((content) => Object.keys(content).length > 0, {
    message: 'At least one content field must be provided',
  });
export type UpdateContentDto = z.infer<typeof updateContentSchema>;

export const contentIdSchema = z.string().cuid();
export const contentUnitIdSchema = z.string().cuid();
