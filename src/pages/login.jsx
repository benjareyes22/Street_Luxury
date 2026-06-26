import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [message, setMessage] = useState(location.state?.successMessage || "");
  const [messageType, setMessageType] = useState(
    location.state?.successMessage ? "success" : "error"
  );
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    const result = await login(form.email, form.password);

    setLoading(false);

    if (!result.ok) {
      setMessageType("error");
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
        <p>Ingresa a tu cuenta para acceder a la tienda.</p>

        {message && (
          <div
            className={`formMessage ${
              messageType === "success" ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}

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

          <button type="submit" className="primaryBtn authSubmit" disabled={loading}>
            {loading ? "Ingresando..." : "Entrar"}
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