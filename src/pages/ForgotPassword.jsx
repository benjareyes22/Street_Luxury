import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function ForgotPassword() {
  const { recoverAccount } = useAuth();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const result = recoverAccount(email);
    setMessage(result.message);

    if (result.ok) {
      setEmail("");
    }
  };

  return (
    <section className="authPage">
      <div className="authCard">
        <span className="authBadge">Recuperar cuenta</span>
        <h1>¿Olvidaste tu contraseña?</h1>
        <p>
          Ingresa tu correo y te enviaremos instrucciones para recuperar tu
          cuenta.
        </p>

        {message && <div className="formMessage success">{message}</div>}

        <form className="authForm" onSubmit={handleSubmit}>
          <label>
            Correo electrónico
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <button type="submit" className="primaryBtn authSubmit">
            Recuperar cuenta
          </button>
        </form>

        <Link className="linkButton" to="/login">
          Volver al inicio de sesión
        </Link>
      </div>
    </section>
  );
}

export default ForgotPassword;