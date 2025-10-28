interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
}

const PDFViewer = ({ isOpen, onClose, pdfUrl }: PDFViewerProps) => {
  if (!isOpen) return null;

  // Construir URL absoluta para evitar problemas con rutas relativas
  const absoluteUrl = new URL(pdfUrl, window.location.origin).href;

  return (
    <div className="pdf-modal-overlay" onClick={onClose}>
      <div className="pdf-modal-content" onClick={e => e.stopPropagation()}>
        <button className="pdf-close-btn" onClick={onClose}>×</button>
        <iframe
          src={`${absoluteUrl}#view=FitH`}
          className="pdf-viewer"
          title="CV Viewer"
        />
        <div style={{display:'none'}}>
          <a href={absoluteUrl} target="_blank" rel="noopener noreferrer" className="btn" download>Descargar</a>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;