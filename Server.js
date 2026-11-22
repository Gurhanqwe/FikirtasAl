import express from 'express';
import OpenAI from 'openai';

const app = express();
app.use(express.json());

const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
  });

  app.post('/api/fikir', async (req, res) => {
    try {
        const { fikir } = req.body;

            if (!fikir?.trim()) {
                  return res.status(400).json({
                          hata: 'Önce bir fikir yaz.'
                                });
                                    }

                                        const cevap = await ai.responses.create({
                                              model: 'gpt-4.1-mini',
                                                    instructions: 'Türkçe konuş. Kullanıcının fikrini geliştirmek için yaratıcı, uygulanabilir öneriler sun.',
                                                          input: fikir
                                                              });

                                                                  res.json({ sonuc: cevap.output_text });
                                                                    } catch (error) {
                                                                        res.status(500).json({
                                                                              hata: 'Yapay zekâ yanıt veremedi.'
                                                                                  });
                                                                                    }
                                                                                    });

                                                                                    app.listen(3001, () => {
                                                                                      console.log('Fikir Taşı AI sunucusu hazır!');
                                                                                      });
                                                                                      