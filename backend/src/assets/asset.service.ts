import { asc, eq } from 'drizzle-orm';

import { db } from '../db';
import { assets } from '../db/schema';

export async function getAssets() {
  return db.select().from(assets).orderBy(asc(assets.id));
}

export async function getAssetById(id: number) {
  const [asset] = await db.select().from(assets).where(eq(assets.id, id));
  return asset;
}

export async function createAsset(data: {
  name: string;
  description?: string;
  assetTag: string;
  status: string;
}) {
  const [asset] = await db.insert(assets).values(data).returning();
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
  return asset;
}

export async function deleteAsset(id: number) {
  const [asset] = await db
    .delete(assets)
    .where(eq(assets.id, id))
    .returning();
  return asset;
}