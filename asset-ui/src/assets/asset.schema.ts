import { z } from 'zod'

export const assetFormSchema = z.object({
  name: z.string({
    error: (issue) => issue.input === undefined ? 'Asset name is required.' : 'Asset name must be a valid text value.',
  }).trim().min(1, 'Asset name is required.').max(255, 'Asset name must not exceed 255 characters.'),
  assetTag: z.string({
    error: (issue) => issue.input === undefined ? 'Asset tag is required.' : 'Asset tag must be a valid text value.',
  }).trim().min(1, 'Asset tag is required.').max(100, 'Asset tag must not exceed 100 characters.'),
  description: z.union([
    z.literal(''),
    z.string({ error: 'Description must be a valid text value.' })
      .trim()
      .min(1, 'Description cannot be empty or contain only whitespace.')
      .max(5000, 'Description must not exceed 5,000 characters.'),
  ]),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'MAINTENANCE'], {
    error: (issue) => issue.input === undefined ? 'Status is required.' : 'Invalid status. Please select AVAILABLE, ASSIGNED, or MAINTENANCE.',
  }),
}).strict()

export type AssetForm = z.infer<typeof assetFormSchema>

export function getAssetFormErrors(form: AssetForm): Record<string, string> {
  const result = assetFormSchema.safeParse(form)
  if (result.success) return {}

  return Object.fromEntries(
    result.error.issues
      .filter((issue) => issue.path.length > 0)
      .map((issue) => [issue.path.join('.'), issue.message]),
  )
}