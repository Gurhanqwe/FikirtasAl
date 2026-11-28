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
    const { fikir, gecmis = [] } = req.body;

    if (typeof fikir !== 'string' || !fikir.trim()) {
      return res.status(400).json({
        hata: 'Önce bir mesaj yaz.'
      });
    }

    const sohbet = Array.isArray(gecmis)
      ? gecmis.slice(-20).filter(m =>
          m &&
          ['user', 'model'].includes(m.role) &&
          typeof m.text === 'string'
        ).map(m => ({
          role: m.role,
          parts: [{ text: m.text.slice(0, 12000) }]
        }))
      : [];

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-4-hydrogen:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: 'Sen FİKİRTAŞ AI adlı Türkçe yapay zekâ asistanısın. Önceki konuşmaları dikkate al. Kullanıcının sorularını bağlama uygun cevapla. Fikirlerini analiz et ve geliştir. Gerektiğinde iş planı, maliyet ve gelir tahminleri sun. Kesin olmayan bilgileri tahmin olarak belirt.'
            }]
          },
          contents: [
            ...sohbet,
            {
              role: 'user',
              parts: [{ text: fikir }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini hatası:', response.status);

      return res.status(response.status).json({
        hata: response.status === 429
          ? 'Kullanım limitine ulaşıldı. Lütfen daha sonra tekrar deneyin.'
          : 'Bir hata oluştu. Lütfen tekrar deneyin.'
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

app.listen(process.env.PORT || 3003, () => {
  console.log('FİKİRTAŞ AI sunucusu hazır!');
});
