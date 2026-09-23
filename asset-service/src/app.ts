import express from 'express';
import cors from 'cors';

import router from './assets/asset.route';
import { errorMiddleware } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
  });
});

app.use('/api/assets', router);

app.use(errorMiddleware);

export default app;