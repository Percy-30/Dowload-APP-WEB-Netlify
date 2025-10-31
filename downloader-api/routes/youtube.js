import express from 'express';
import { spawn } from 'child_process';

const router = express.Router();

// POST /api/youtube/info - Obtener información del video
router.post('/info', async (req, res) => {
  try {
    const { url } = req.body;

    console.log('📥 Procesando YouTube URL:', url);

    if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
      return res.status(400).json({ 
        error: 'URL de YouTube inválida' 
      });
    }

    // yt-dlp FUNCIONA en Railway
    const ytProcess = spawn('yt-dlp', [
      '--dump-json',
      '--no-warnings',
      '--no-check-certificates',
      '--geo-bypass',
      url
    ]);

    let output = '';
    let errorOutput = '';

    ytProcess.stdout.on('data', (data) => output += data.toString());
    ytProcess.stderr.on('data', (data) => errorOutput += data.toString());

    const exitCode = await new Promise((resolve) => {
      ytProcess.on('close', resolve);
    });

    if (exitCode !== 0 || !output) {
      return res.status(500).json({
        error: 'Error al procesar video de YouTube',
        details: errorOutput
      });
    }

    const info = JSON.parse(output);
    
    // Filtrar formatos válidos (igual que tu lógica original)
    const formats = (info.formats || [])
      .filter((f) => f.url && (f.vcodec !== 'none' || f.acodec !== 'none'))
      .map((f) => ({
        quality: f.format_note || `Format ${f.format_id}`,
        format: f.ext || 'mp4',
        resolution: f.width && f.height ? `${f.width}x${f.height}` : f.resolution || 'HD',
        fps: f.fps || null,
        size: f.filesize ? `${(f.filesize / 1024 / 1024).toFixed(1)} MB` : 'Desconocido',
        url: f.url,
        hasAudio: f.acodec !== 'none',
        hasVideo: f.vcodec !== 'none'
      }));

    // Si no hay formatos, usar URL principal
    if (formats.length === 0 && info.url) {
      formats.push({
        quality: 'Calidad por defecto',
        format: info.ext || 'mp4',
        resolution: 'HD',
        size: 'Desconocido',
        url: info.url,
        hasAudio: true,
        hasVideo: true
      });
    }

    const responseData = {
      status: 'success',
      platform: 'youtube',
      title: info.title || 'Video de YouTube',
      thumbnail: info.thumbnail || '',
      duration: info.duration || 0,
      uploader: info.uploader || 'Desconocido',
      view_count: info.view_count || 0,
      method: 'yt-dlp (Railway)',
      formats: formats
    };

    console.log('✅ YouTube info obtenida exitosamente');
    res.json(responseData);

  } catch (error) {
    console.error('💥 YouTube API error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;