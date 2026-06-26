import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoLuxury from "../assets/logoluxury.jpeg";

function Navbar() {
  const { user, perfil, logout } = useAuth();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);

  const nombreUsuario =
    perfil?.nombre || user?.email?.split("@")[0] || "Usuario";

  const inicial = nombreUsuario.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
    setOpenMenu(false);
    navigate("/");
  };

  return (
    <header className="navbar">
      <Link className="logo logoButton logoWithImage" to="/">
        <img src={logoLuxury} alt="Street Luxury" />
        <span>Street Luxury</span>
      </Link>

      <nav>
        <Link to="/">Inicio</Link>
        <Link to="/productos">Productos</Link>
        <a href="/#contacto">Contacto</a>

        {user ? (
          <div className="userMenuWrapper">
            <button
              className="userMenuButton"
              type="button"
              onClick={() => setOpenMenu(!openMenu)}
            >
              {perfil?.avatar_url ? (
                <img
                  src={perfil.avatar_url}
                  alt={nombreUsuario}
                  className="userAvatar"
                />
              ) : (
                <span className="userAvatarFallback">{inicial}</span>
              )}
            </button>

            {openMenu && (
              <div className="userDropdown">
                <div className="userDropdownHeader">
                  {perfil?.avatar_url ? (
                    <img
                      src={perfil.avatar_url}
                      alt={nombreUsuario}
                      className="dropdownAvatar"
                    />
                  ) : (
                    <span className="dropdownAvatarFallback">{inicial}</span>
                  )}

                  <div>
                    <strong>{nombreUsuario}</strong>
                    <p>{user.email}</p>
                  </div>
                </div>

                <Link onClick={() => setOpenMenu(false)} to="/perfil">
                  Mi perfil
                </Link>

                {perfil?.rol === "admin" && (
                  <Link onClick={() => setOpenMenu(false)} to="/admin">
                    Panel admin
                  </Link>
                )}

                <button type="button" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
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