import express from 'express';
import cors from 'cors';

import router from './assets/asset.route';
import { errorMiddleware } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';

const app = express();

app.use(cors());
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