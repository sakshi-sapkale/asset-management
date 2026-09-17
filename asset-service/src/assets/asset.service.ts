import { asc, eq } from 'drizzle-orm';

import { db } from '../db';
import { logger } from '../logger';
import { assets } from '../db/schema';

export async function getAssets() {
  const result = await db.select().from(assets).orderBy(asc(assets.id));
  logger.info({ operation: 'getAssets', response: result }, 'Asset response');
  return result;
}

export async function getAssetById(id: number) {
  const [asset] = await db.select().from(assets).where(eq(assets.id, id));
  logger.info(
    { operation: 'getAssetById', assetId: id, response: asset },
    'Asset response',
  );
  return asset;
}

export async function createAsset(data: {
  name: string;
  description?: string;
  assetTag: string;
  status: string;
}) {
  const [asset] = await db.insert(assets).values(data).returning();
  logger.info(
    { operation: 'createAsset', response: asset },
    'Asset response',
  );
  return asset;
}

export async function updateAsset(
  id: number,
  data: {
    name?: string;
    description?: string;
    assetTag?: string;
    status?: string;
  },
) {
  const [asset] = await db
    .update(assets)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(assets.id, id))
    .returning();
  logger.info(
    { operation: 'updateAsset', assetId: id, response: asset },
    'Asset response',
  );
  return asset;
}

export async function deleteAsset(id: number) {
  const [asset] = await db
    .delete(assets)
    .where(eq(assets.id, id))
    .returning();
  logger.info(
    { operation: 'deleteAsset', assetId: id, response: asset },
    'Asset response',
  );
  return asset;
}