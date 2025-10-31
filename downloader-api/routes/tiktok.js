import express from 'express';

const router = express.Router();

// Endpoint básico para TikTok (no usará yt-dlp)
router.post('/info', async (req, res) => {
  try {
    const { url } = req.body;
    
    console.log('📱 TikTok Info Request (Railway):', url);

    // Como TikTok se maneja en Vercel, redirigimos o damos mensaje
    res.json({
      status: 'success',
      platform: 'tiktok',
      message: 'TikTok se procesa en el frontend de Vercel',
      original_url: url,
      method: 'frontend_processing'
    });

  } catch (error) {
    console.error('TikTok API error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;