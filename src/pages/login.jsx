import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    const result = login(form.email, form.password);

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    navigate("/");
  };

  return (
    <section className="authPage">
      <div className="authCard">
        <span className="authBadge">Bienvenido</span>
        <h1>Iniciar sesión</h1>
        <p>Ingresa a tu cuenta para revisar tus compras y favoritos.</p>

        {message && <div className="formMessage error">{message}</div>}

        <form className="authForm" onSubmit={handleSubmit}>
          <label>
            Correo electrónico
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
            />
          </label>

          <button type="submit" className="primaryBtn authSubmit">
            Entrar
          </button>
        </form>

        <Link className="linkButton" to="/recuperar-cuenta">
          ¿Olvidaste tu contraseña?
        </Link>

        <p className="authFooter">
          ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;