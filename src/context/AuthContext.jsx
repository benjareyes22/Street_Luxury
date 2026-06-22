import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("streetLuxurySession");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem("streetLuxuryUsers");
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  const saveUsers = (newUsers) => {
    setUsers(newUsers);
    localStorage.setItem("streetLuxuryUsers", JSON.stringify(newUsers));
  };

  const saveSession = (loggedUser) => {
    setUser(loggedUser);
    localStorage.setItem("streetLuxurySession", JSON.stringify(loggedUser));
  };

  const register = ({ name, email, password, confirmPassword }) => {
    if (!name || !email || !password || !confirmPassword) {
      return { ok: false, message: "Completa todos los campos." };
    }

    if (password.length < 6) {
      return {
        ok: false,
        message: "La contraseña debe tener mínimo 6 caracteres.",
      };
    }

    if (password !== confirmPassword) {
      return { ok: false, message: "Las contraseñas no coinciden." };
    }

    const userExists = users.some(
      (item) => item.email.toLowerCase() === email.toLowerCase()
    );

    if (userExists) {
      return { ok: false, message: "Ya existe una cuenta con ese correo." };
    }

    const newUser = {
      id: String(Date.now()),
      name,
      email,
      password,
    };

    saveUsers([...users, newUser]);

    saveSession({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    });

    return { ok: true };
  };

  const login = (email, password) => {
    if (!email || !password) {
      return { ok: false, message: "Ingresa tu correo y contraseña." };
    }

    const foundUser = users.find(
      (item) =>
        item.email.toLowerCase() === email.toLowerCase() &&
        item.password === password
    );

    if (!foundUser) {
      return { ok: false, message: "Correo o contraseña incorrectos." };
    }

    saveSession({
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
    });

    return { ok: true };
  };

  const recoverAccount = (email) => {
    if (!email) {
      return { ok: false, message: "Ingresa tu correo." };
    }

    return {
      ok: true,
      message:
        "Si el correo está registrado, enviaremos instrucciones para recuperar la cuenta. Por ahora es una simulación visual.",
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("streetLuxurySession");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        recoverAccount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}