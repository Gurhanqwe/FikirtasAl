import './App.css';
import { useState } from 'react';

export default function App() {
  const [fikir, setFikir] = useState('');
  const [sonuc, setSonuc] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  async function fikirUret() {
    if (!fikir.trim()) return;

    setYukleniyor(true);
    setSonuc('');

    try {
      const response = await fetch('/api/fikir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fikir })
      });

      const data = await response.json();

      setSonuc(
        data.sonuc || data.cevap || data.result ||
        data.hata || data.error || 'Sonuç alınamadı.'
      );
    } catch {
      setSonuc('Sunucu bağlantısı kurulamadı.');
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <main style={{ padding: 30, textAlign: 'center' }}>
      
<img src="/logo.png" alt="FİKİRTAŞ AI" style={{ width: 250, maxWidth: '100%' }} />
      <p>Hayallerini yapay zekâ ile gerçeğe dönüştür.</p>

      <textarea
        value={fikir}
        onChange={e => setFikir(e.target.value)}
        placeholder="Fikrini buraya yaz..."
        rows={5}
        style={{ width: '90%', maxWidth: 500 }}
      />

      <div>
        <button onClick={fikirUret} disabled={yukleniyor}>
          {yukleniyor ? 'Analiz ediliyor...' : 'Fikir Üret'}
        </button>
      </div>

      <div style={{ whiteSpace: 'pre-wrap', textAlign: 'left', lineHeight: 1.8, maxWidth: 800, margin: '30px auto' }}>{sonuc}</div>
    </main>
  );
}