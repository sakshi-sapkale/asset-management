import { Request, Response } from 'express';

import {
  createAsset,
  deleteAsset,
  getAssetById,
  getAssets,
  updateAsset,
} from './asset.service';

export async function getAssetsController(
  _req: Request,
  res: Response,
) {
  const assets = await getAssets();

  res.json(assets);
}

export async function getAssetController(
  req: Request,
  res: Response,
) {
  const id = Number(req.params.id);

  const asset = await getAssetById(id);

  if (!asset) {
    return res.status(404).json({ message: 'Asset not found' });
  }

  res.json(asset);
}

export async function createAssetController(
  req: Request,
  res: Response,
) {
  const asset = await createAsset(req.body);

  res.status(201).json(asset);
}

export async function updateAssetController(
  req: Request,
  res: Response,
) {
  const id = Number(req.params.id);

  const asset = await updateAsset(id, req.body);

  if (!asset) {
    return res.status(404).json({ message: 'Asset not found' });
  }

  res.json(asset);
}

export async function deleteAssetController(
  req: Request,
  res: Response,
) {
  const id = Number(req.params.id);

  const asset = await deleteAsset(id);

  if (!asset) {
    return res.status(404).json({ message: 'Asset not found' });
  }

  res.status(204).send();
}