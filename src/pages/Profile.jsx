import { useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, perfil, loading, updatePerfilLocal } = useAuth();

  const [nombre, setNombre] = useState(perfil?.nombre || "");
  const [avatarPreview, setAvatarPreview] = useState(perfil?.avatar_url || "");
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  if (loading) {
    return <section className="authPage">Cargando...</section>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const inicial = (nombre || user.email || "U").charAt(0).toUpperCase();

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMensaje("Solo puedes subir imágenes.");
      return;
    }

    setArchivo(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const subirAvatar = async () => {
    if (!archivo) {
      return perfil?.avatar_url || null;
    }

    const extension = archivo.name.split(".").pop();
    const fileName = `avatar-${Date.now()}.${extension}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, archivo, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMensaje("");
    setGuardando(true);

    try {
      const avatarUrl = await subirAvatar();

      const { data, error } = await supabase
        .from("perfiles")
        .update({
          nombre,
          avatar_url: avatarUrl,
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      updatePerfilLocal(data);
      setMensaje("Perfil actualizado correctamente.");
      setArchivo(null);
    } catch (error) {
      setMensaje(error.message || "No se pudo actualizar el perfil.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="authPage">
      <div className="authCard">
        <span className="authBadge">Mi cuenta</span>
        <h1>Editar perfil</h1>
        <p>Cambia tu nombre y foto de perfil.</p>

        {mensaje && <div className="formMessage success">{mensaje}</div>}

        <form className="authForm" onSubmit={handleSubmit}>
          <div className="profileUploadBox">
            <div className="profilePreview">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Foto de perfil" />
              ) : (
                <span>{inicial}</span>
              )}
            </div>

            <label className="uploadAvatarButton">
              Subir foto
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <label>
            Nombre
            <input
              type="text"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
            />
          </label>

          <button type="submit" className="primaryBtn authSubmit">
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Profile;