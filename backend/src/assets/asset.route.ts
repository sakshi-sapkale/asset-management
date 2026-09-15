import { Router } from 'express';

import {
  createAssetController,
  deleteAssetController,
  getAssetController,
  getAssetsController,
  updateAssetController,
} from './asset.controller';

const router = Router();

router.get('/', getAssetsController);
router.get('/:id', getAssetController);
router.post('/', createAssetController);
router.put('/:id', updateAssetController);
router.delete('/:id', deleteAssetController);

export default router;