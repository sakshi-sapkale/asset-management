import { Router } from 'express';

import {
  createAssetController,
  deleteAssetController,
  getAssetController,
  getAssetsController,
  updateAssetController,
} from './asset.controller';
import {
  createAssetSchema,
  assetIdSchema,
  updateAssetSchema,
} from './asset.schema';
import { validateBody, validateParam } from '../middleware/validation.middleware';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);
router.get('/', getAssetsController);
router.get('/:id', validateParam('id', assetIdSchema), getAssetController);
router.post('/', requireAdmin, validateBody(createAssetSchema), createAssetController);
router.put(
  '/:id',
  requireAdmin,
  validateParam('id', assetIdSchema),
  validateBody(updateAssetSchema),
  updateAssetController,
);
router.delete(
  '/:id',
  requireAdmin,
  validateParam('id', assetIdSchema),
  deleteAssetController,
);

export default router;