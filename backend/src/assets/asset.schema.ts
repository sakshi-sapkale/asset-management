import { z } from 'zod';

const assetSchema = z.object({
  name: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? 'Asset name is required.'
          : 'Asset name must be a valid text value.',
    })
    .trim()
    .min(1, 'Asset name is required.')
    .max(255, 'Asset name must not exceed 255 characters.'),

  assetTag: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? 'Asset tag is required.'
          : 'Asset tag must be a valid text value.',
    })
    .trim()
    .min(1, 'Asset tag is required.')
    .max(100, 'Asset tag must not exceed 100 characters.'),

  description: z
    .string({ error: 'Description must be a valid text value.' })
    .trim()
    .min(1, 'Description cannot be empty or contain only whitespace.')
    .max(5000, 'Description must not exceed 5,000 characters.')
    .optional(),

  status: z.enum(['AVAILABLE', 'ASSIGNED', 'MAINTENANCE'], {
    error: (issue) =>
      issue.input === undefined
        ? 'Status is required.'
        : 'Invalid status. Please select AVAILABLE, ASSIGNED, or MAINTENANCE.',
  }),
}).strict();

export const createAssetSchema = assetSchema;

export const updateAssetSchema = assetSchema.partial();

const invalidAssetIdMessage = 'Asset ID must be a valid positive integer.';

export const assetIdSchema = z.coerce
  .number({ error: invalidAssetIdMessage })
  .int(invalidAssetIdMessage)
  .positive(invalidAssetIdMessage);