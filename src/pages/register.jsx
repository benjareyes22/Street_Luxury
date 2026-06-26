import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const result = await register(form);

    setLoading(false);

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    navigate("/login", {
      state: {
        successMessage:
          "Cuenta creada correctamente. Ahora inicia sesión con tu correo y contraseña.",
      },
    });
  };

  return (
    <section className="authPage">
      <div className="authCard">
        <span className="authBadge">Crear cuenta</span>
        <h1>Registro</h1>
        <p>Crea tu cuenta para comprar más rápido y guardar tus datos.</p>

        {message && <div className="formMessage error">{message}</div>}

        <form className="authForm" onSubmit={handleSubmit}>
          <label>
            Nombre
            <input
              type="text"
              placeholder="Tu nombre"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
            />
          </label>

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
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
            />
          </label>

          <label>
            Confirmar contraseña
            <input
              type="password"
              placeholder="Repite tu contraseña"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm({ ...form, confirmPassword: event.target.value })
              }
            />
          </label>

          <button type="submit" className="primaryBtn authSubmit" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="authFooter">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </section>
  );
}

export default Register;