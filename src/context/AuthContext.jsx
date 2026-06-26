import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargarPerfil = async (userId) => {
    const { data, error } = await supabase
      .from("perfiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      setPerfil(null);
      return null;
    }

    setPerfil(data);
    return data;
  };

  useEffect(() => {
    const iniciarSesion = async () => {
      const { data } = await supabase.auth.getSession();

      const currentUser = data.session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await cargarPerfil(currentUser.id);
      }

      setLoading(false);
    };

    iniciarSesion();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await cargarPerfil(currentUser.id);
        } else {
          setPerfil(null);
        }

        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const register = async ({ name, email, password, confirmPassword }) => {
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

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre: name,
        },
      },
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true };
  };

  const login = async (email, password) => {
    if (!email || !password) {
      return { ok: false, message: "Ingresa tu correo y contraseña." };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        ok: false,
        message:
          "No se pudo iniciar sesión. Revisa tu correo, contraseña o confirma tu email.",
      };
    }

    setUser(data.user);
    await cargarPerfil(data.user.id);

    return { ok: true };
  };

  const recoverAccount = async (email) => {
    if (!email) {
      return { ok: false, message: "Ingresa tu correo." };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      return { ok: false, message: error.message };
    }

    return {
      ok: true,
      message:
        "Si el correo está registrado, recibirás instrucciones para recuperar tu cuenta.",
    };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPerfil(null);
  };
  const updatePerfilLocal = (nuevoPerfil) => {
  setPerfil(nuevoPerfil);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        perfil,
        loading,
        login,
        register,
        recoverAccount,
        logout,
        updatePerfilLocal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}