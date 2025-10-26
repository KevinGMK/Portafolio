import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import InicioPage from './pages/InicioPage'
import ProyectosPage from './pages/ProyectosPage'
import ContactoPage from './pages/ContactoPage'
import Footer from './components/Footer'

function App() {
  return (
    <div className="app-root">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<InicioPage />} />
          <Route path="/proyectos" element={<ProyectosPage />} />
          <Route path="/contacto" element={<ContactoPage />} />
          <Route
            path="*"
            element={<Navigate to="/" replace state={{ from: window.location.pathname }} />}
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
