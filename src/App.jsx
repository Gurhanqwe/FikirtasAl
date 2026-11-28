import './App.css';
import { useState } from 'react';

export default function App() {
  const [fikir, setFikir] = useState('');
  const [gecmis, setGecmis] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');

  async function fikirUret() {
    if (!fikir.trim() || yukleniyor) return;

    const mesaj = fikir.trim();
    setYukleniyor(true);
    setHata('');

    try {
      const response = await fetch('/api/fikir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fikir: mesaj,
          gecmis
        })
      });

      const data = await response.json();
      const cevap = data.sonuc || data.cevap || data.result;

      if (!response.ok || !cevap) {
        setHata(data.hata || data.error || 'Yanıt alınamadı.');
        return;
      }

      setGecmis(eski => [
        ...eski,
        { role: 'user', text: mesaj },
        { role: 'model', text: cevap }
      ]);

      setFikir('');

    } catch {
      setHata('Sunucu bağlantısı kurulamadı.');
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <main style={{ padding: 30, textAlign: 'center' }}>

      <img
        src="/logo.png"
        alt="FİKİRTAŞ AI"
        style={{ width: 250, maxWidth: '100%' }}
      />

      <p>Fikirden Değere</p>

      <button
        disabled={yukleniyor}
        onClick={() => {
          setGecmis([]);
          setFikir('');
          setHata('');
        }}
      >
        + Yeni Sohbet
      </button>

      <div style={{
        maxWidth: 800,
        margin: '20px auto',
        textAlign: 'left'
      }}>
        {gecmis.map((mesaj, i) => (
          <div key={i} style={{
            padding: 16,
            marginBottom: 12,
            borderRadius: 12,
            background: mesaj.role === 'user'
              ? '#4338ca'
              : '#1e293b',
            color: 'white',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere'
          }}>
            <strong>
              {mesaj.role === 'user'
                ? 'Siz'
                : 'FİKİRTAŞ AI'}
            </strong>
            <p>{mesaj.text}</p>
          </div>
        ))}
      </div>

      <textarea
        value={fikir}
        disabled={yukleniyor}
        onChange={e => setFikir(e.target.value)}
        placeholder="Mesajınızı yazın..."
        rows={4}
        style={{ width: '90%', maxWidth: 600 }}
      />

      <div>
        <button
          onClick={fikirUret}
          disabled={yukleniyor || !fikir.trim()}
        >
          {yukleniyor ? 'Düşünüyor...' : 'Gönder'}
        </button>
      </div>

      {hata && <p role="alert">{hata}</p>}

    </main>
  );
}
