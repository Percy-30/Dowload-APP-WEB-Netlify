import express from 'express';
import { spawn } from 'child_process';
import fs from 'fs';

const router = express.Router();

// POST /api/facebook/info - ENDPOINT PRINCIPAL (FALTABA ESTE)
router.post('/info', async (req, res) => {
  try {
    const { url } = req.body;

    console.log('📥 Facebook Info Request en Railway:', url);

    if (!url || (!url.includes('facebook.com') && !url.includes('fb.watch'))) {
      return res.status(400).json({ 
        error: 'URL de Facebook inválida'
      });
    }

    console.log('🔍 Ejecutando yt-dlp para Facebook...');

    const ytProcess = spawn('yt-dlp', [
      '--dump-json',
      '--no-warnings',
      '--no-check-certificates',
      '--geo-bypass',
      url
    ]);

    let output = '';
    let errorOutput = '';

    ytProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    ytProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    const exitCode = await new Promise((resolve) => {
      ytProcess.on('close', resolve);
    });

    if (exitCode !== 0 || !output) {
      return res.status(500).json({
        error: 'Error al procesar el video de Facebook',
        details: errorOutput
      });
    }

    const info = JSON.parse(output);
    
    const formats = info.formats?.map(format => ({
      quality: format.format_note || 'HD',
      format: format.ext || 'mp4',
      resolution: format.resolution || '1920x1080',
      size: format.filesize ? `${(format.filesize / 1024 / 1024).toFixed(1)} MB` : 'Desconocido',
      url: format.url,
      hasAudio: !!format.audio_codec
    })) || [];

    const responseData = {
      status: 'success',
      platform: 'facebook',
      title: info.title || 'Video de Facebook',
      thumbnail: info.thumbnail || '',
      duration: info.duration || 0,
      width: info.width || null,
      height: info.height || null,
      method: 'yt-dlp (Railway)',
      formats: formats,
      original_url: url
    };

    console.log('✅ Facebook info obtenida exitosamente');
    res.json(responseData);

  } catch (error) {
    console.error('💥 Facebook API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/facebook/audio - Descargar audio
router.post('/audio', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL requerida' });
    }

    console.log('🎵 Descargando audio de Facebook:', url);

    const timestamp = Date.now();
    const outputFile = `./tmp/facebook_audio_${timestamp}`; // Cambié /tmp a ./tmp para Windows

    const audioProcess = spawn('yt-dlp', [
      '-x',
      '--audio-format', 'mp3',
      '--audio-quality', '0',
      '--no-warnings',
      '--no-check-certificates',
      '-o', `${outputFile}.%(ext)s`,
      url
    ]);

    let errorOutput = '';

    audioProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    const exitCode = await new Promise((resolve) => {
      audioProcess.on('close', resolve);
    });

    const audioFile = `${outputFile}.mp3`;

    if (exitCode !== 0 || !fs.existsSync(audioFile)) {
      return res.status(500).json({
        error: 'Error al generar audio',
        details: errorOutput
      });
    }

    // Enviar archivo directamente
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="facebook_audio_${timestamp}.mp3"`);
    
    const fileStream = fs.createReadStream(audioFile);
    fileStream.pipe(res);

    // Limpiar después de enviar
    fileStream.on('end', () => {
      if (fs.existsSync(audioFile)) {
        fs.unlinkSync(audioFile);
      }
    });

  } catch (error) {
    console.error('Audio download error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/facebook/video - Descargar video
router.post('/video', async (req, res) => {
  try {
    const { url, quality = 'best' } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL requerida' });
    }

    console.log('🎬 Descargando video de Facebook:', { url, quality });

    const timestamp = Date.now();
    const outputFile = `./tmp/facebook_video_${timestamp}.mp4`; // Cambié /tmp a ./tmp para Windows

    const args = [
      '--no-warnings',
      '--no-check-certificates',
      '--format', quality,
      '-o', outputFile,
      url
    ];

    const videoProcess = spawn('yt-dlp', args);

    let errorOutput = '';

    videoProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    const exitCode = await new Promise((resolve) => {
      videoProcess.on('close', resolve);
    });

    if (exitCode !== 0 || !fs.existsSync(outputFile)) {
      return res.status(500).json({
        error: 'Error al descargar video',
        details: errorOutput
      });
    }

    // Enviar archivo directamente
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="facebook_video_${quality}_${timestamp}.mp4"`);
    
    const fileStream = fs.createReadStream(outputFile);
    fileStream.pipe(res);

    // Limpiar después de enviar
    fileStream.on('end', () => {
      if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);
      }
    });

  } catch (error) {
    console.error('Video download error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;