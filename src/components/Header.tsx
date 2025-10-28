import { useState } from 'react';
import PDFViewer from './PDFViewer';
import foto from '../assets/foto.jpg';

const Header = () => {
  const [isPDFOpen, setIsPDFOpen] = useState(false);
  const pdfUrl = import.meta.env.BASE_URL + "assets/pdf/Curriculum_Huayta_Kevin.pdf";

  return (
    <div className="header" id="header">
      <div className="info">
        <img id="headerPhoto" src={foto} alt="Foto de Kevin" />
        <h1>Kevin Jose Enrrique</h1>
        <h1>Huayta Regalado</h1>
        <h4>Edad: 21 años</h4>
        <h4 className="ubicacion">📍 Ubicación: Independencia, Lima, Perú</h4>
        <h4 className="descripcion">
          Me gusta programar, me apasiona lo que se puede hacer con esfuerzo y códigos,
          me gusta saber cuanto puede avanzar la tecnología y los programas.
        </h4>
        <button 
          className="btn" 
          id="cvBtn"
          onClick={() => {
            fetch(pdfUrl)
              .then(response => {
                if (!response.ok) {
                  console.error('El PDF no se encuentra en la ruta:', pdfUrl);
                  alert('Lo siento, el CV no está disponible en este momento.');
                } else {
                  setIsPDFOpen(true);
                }
              })
              .catch(error => {
                console.error('Error al acceder al PDF:', error);
                alert('Lo siento, hubo un error al intentar abrir el CV.');
              });
          }}
        >
          📄 Ver mi CV
        </button>
        
        <PDFViewer
          isOpen={isPDFOpen}
          onClose={() => setIsPDFOpen(false)}
          pdfUrl={pdfUrl}
        />
      </div>

      {/* Imagen lateral para pantallas grandes; oculta en móvil */}
      <img id="headerSidePhoto" src={foto} alt="Foto de Kevin" />
    </div>
  );
};

export default Header;
