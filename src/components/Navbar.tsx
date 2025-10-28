import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleInicioClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="nav-bar" id="navBar">
      <ul>
        <li>
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? 'active' : ''}
            onClick={handleInicioClick}
            end
          >
            Inicio
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/proyectos" 
            className={({ isActive }) => {
              console.log('Estado Proyectos:', isActive);
              return isActive ? 'active' : '';
            }}
            onClick={() => console.log('Clic en Proyectos')}
          >
            Proyectos
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/contacto" 
            className={({ isActive }) => {
              console.log('Estado Contacto:', isActive);
              return isActive ? 'active' : '';
            }}
            onClick={() => console.log('Clic en Contacto')}
          >
            Contacto
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
