import { z } from 'zod';

const subjectFields = {
  title: z.string().trim().min(1).max(150),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must use lowercase letters, numbers, and hyphens',
    ),
  code: z.string().trim().min(1).max(32).nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  creditHours: z.number().int().min(1).max(1000).nullable().optional(),
  sortingOrder: z.number().int().min(0).max(1_000_000).optional(),
};

export const createSubjectSchema = z.object(subjectFields);
export type CreateSubjectDto = z.infer<typeof createSubjectSchema>;

export const updateSubjectSchema = z.object(subjectFields).partial();
export type UpdateSubjectDto = z.infer<typeof updateSubjectSchema>;

export const subjectIdSchema = z.string().cuid();
