import express from 'express';
import cors from 'cors';

import router from './assets/asset.route';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
  });
});

app.use('/api/assets', router);

export default app;