
const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© {year} <span className="highlight">KevinGMK</span>. Todos los derechos reservados.</p>
        <p className="footer-tagline">
          💻 Desarrollador Web | React • Firebase • Node.js
        </p>
      </div>
    </footer>
  );
};

export default Footer;
