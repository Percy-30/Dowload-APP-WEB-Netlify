import express from 'express';
import cors from 'cors';
import facebookRoutes from './routes/facebook.js';
import youtubeRoutes from './routes/youtube.js';
import tiktokRoutes from './routes/tiktok.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/facebook', facebookRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/tiktok', tiktokRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Downloader API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Downloader API - Ready for Social Media Downloads',
    endpoints: {
      facebook: 'POST /api/facebook/info',
      youtube: 'POST /api/youtube/info', 
      tiktok: 'POST /api/tiktok/info',
      health: 'GET /health'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Downloader API running on port ${PORT}`);
});