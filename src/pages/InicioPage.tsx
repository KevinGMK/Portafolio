import { useEffect } from 'react';
import Header from '../components/Header';
import SobreMi from '../components/SobreMi';
import Proyectos from '../components/Proyectos';
import Contactos from '../components/Contactos';

export default function InicioPage() {
  useEffect(() => {
    console.log('InicioPage montado');
    document.title = 'Inicio - Mi Portafolio';
    
    return () => {
      console.log('InicioPage desmontado');
    };
  }, []);

  return (
    <div className="inicio-page">
      <Header />
      <SobreMi />
      <Proyectos />
      <Contactos />

    </div>
  );
}