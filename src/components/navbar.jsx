import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <Link className="logo logoButton" to="/">
        Street Luxury
      </Link>

      <nav>
        <Link to="/">Inicio</Link>
        <a href="/#productos">Productos</a>
        <a href="/#contacto">Contacto</a>

        {user ? (
          <>
            <span className="userPill">Hola, {user.name}</span>
            <button className="navButton" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link className="navButton" to="/login">
              Iniciar sesión
            </Link>
            <Link className="navButton navButtonLight" to="/registro">
              Registrarse
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;