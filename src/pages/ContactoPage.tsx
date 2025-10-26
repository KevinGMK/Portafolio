import Envio from '../components/Envio';
import '../App.css';
import WA from '../assets/whatsApp.png';
import LN from '../assets/linkedin.png';
import GM from '../assets/Gmail.webp';
import GMK from '../assets/youtube.png';
import FB from '../assets/Facebook.png';
import Git from '../assets/github.png';

const ContactoPage = () => {
  return (
    <section className="contacto-page">
      <h1>Redes</h1>
      <div className="contact-container" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div className="contact-links" style={{ minWidth: 220 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '.75rem' }}>
              <a href="https://wa.me/51981323067" target="_blank" rel="noreferrer" className="contact-link">
                <img id="redes" src={WA} alt="WhatsApp" />
                WhatsApp
              </a>
            </li>
            <li style={{ marginBottom: '.75rem' }}>
              <a href="https://www.linkedin.com/in/kevin-jose-enrrique-huayta-regalado-436861255/" target="_blank" rel="noreferrer" className="contact-link">
                <img id="redes" src={LN} alt="Linkedin" /> LinkedIn
              </a>
            </li>
            <li style={{ marginBottom: '.75rem' }}>
              <a href="https://www.facebook.com/kevinjoseenrrique.huaytaregalado/about" target="_blank" rel="noreferrer" className="contact-link">
                <img id="redes" src={FB} alt="Facebook" /> Facebook
              </a>
            </li>
            <li style={{ marginBottom: '.75rem' }}>
              <a href="https://github.com/KevinGMK" target="_blank" rel="noreferrer" className="contact-link">
                <img id="redes" src={Git} alt="Github"/> GitHub
              </a>
            </li>
            <li style={{ marginBottom: '.75rem' }}>
              <a href="https://www.youtube.com/@kevingamermusicykaraoke" target="_blank" rel="noreferrer" className="contact-link">
                <img id="redes" src={GMK} alt="Youtube"/> YouTube
              </a>
            </li>
            <li>
              <a href="mailto:lidia999.j@gmail.com" className="contact-link">
                <img id="redes" src={GM} alt="Gmail"/> Gmail
              </a>
            </li>
          </ul>
        </div>
        <div style={{ flex: 1, minWidth: 320 }}>
          <p>¡Conéctate conmigo a través de cualquiera de estas plataformas! Estoy disponible para oportunidades laborales, colaboraciones o una simple charla.</p>
        </div>
      </div>
      <Envio />
    </section>
  );
};

export default ContactoPage;