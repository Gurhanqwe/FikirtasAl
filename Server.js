import express from 'express';
import { loadEnvFile } from 'node:process';

try {
  loadEnvFile();
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const app = express();
app.use(express.json());

app.post('/api/fikir', async (req, res) => {
  try {
    const { fikir } = req.body;

    if (!fikir?.trim()) {
      return res.status(400).json({
        hata: 'Önce bir fikir yaz.'
      });
    }

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-4-hydrogen:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Bu fikri Türkçe analiz et ve geliştir: ' + fikir
            }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini hatası:", response.status, data.error?.status);

      return res.status(response.status).json({
        hata: response.status === 429 ? 'Günlük kullanım limitine ulaşıldı. Lütfen daha sonra tekrar deneyin.' : 'Bir hata oluştu. Lütfen tekrar deneyin.'
      });
    }

    res.json({
      sonuc: data.candidates?.[0]?.content?.parts
        ?.map(p => p.text || '').join('') || 'Yanıt alınamadı.'
    });

  } catch (error) {
    res.status(500).json({
      hata: 'Sunucu hatası.'
    });
  }
});
app.use(express.static('dist'));
app.listen(process.env.PORT || 3001, ()=> {
  console.log('FIKIRTAS AI sunucusu hazir!');
});
