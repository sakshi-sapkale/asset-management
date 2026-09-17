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

const router = Router();

router.get('/', getAssetsController);
router.get('/:id', validateParam('id', assetIdSchema), getAssetController);
router.post('/', validateBody(createAssetSchema), createAssetController);
router.put(
  '/:id',
  validateParam('id', assetIdSchema),
  validateBody(updateAssetSchema),
  updateAssetController,
);
router.delete(
  '/:id',
  validateParam('id', assetIdSchema),
  deleteAssetController,
);

export default router;