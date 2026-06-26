import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import "../App.css";

const initialForm = {
  nombre: "",
  descripcion: "",
  categoria_id: "",
  precio: "",
  precio_oferta: "",
  stock: "",
  imagen_url: "",
  destacado: false,
  activo: true,
};

function crearSlug(texto) {
  return texto
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function Admin() {
  const { user, perfil, loading } = useAuth();

  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargarCategorias = async () => {
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .eq("activo", true)
      .order("id", { ascending: true });

    if (!error) {
      setCategorias(data);
    }
  };

  const cargarProductos = async () => {
    const { data, error } = await supabase
      .from("productos")
      .select(
        `
        id,
        nombre,
        descripcion,
        precio,
        precio_oferta,
        stock,
        imagen_url,
        activo,
        destacado,
        categoria_id,
        categorias (
          nombre
        )
      `
      )
      .order("created_at", { ascending: false });

    if (!error) {
      setProductos(data);
    }
  };

  useEffect(() => {
    if (perfil?.rol === "admin") {
      cargarCategorias();
      cargarProductos();
    }
  }, [perfil]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensaje("");

    if (!form.nombre || !form.categoria_id || !form.precio || !form.stock) {
      setMensaje("Completa nombre, categoría, precio y stock.");
      return;
    }

    setGuardando(true);

    const nuevoProducto = {
      nombre: form.nombre,
      slug: crearSlug(form.nombre),
      descripcion: form.descripcion || null,
      categoria_id: Number(form.categoria_id),
      precio: Number(form.precio),
      precio_oferta: form.precio_oferta ? Number(form.precio_oferta) : null,
      stock: Number(form.stock),
      imagen_url: form.imagen_url || null,
      destacado: form.destacado,
      activo: form.activo,
    };

    const { error } = await supabase.from("productos").insert(nuevoProducto);

    setGuardando(false);

    if (error) {
      setMensaje(error.message);
      return;
    }

    setMensaje("Producto guardado correctamente.");
    setForm(initialForm);
    cargarProductos();
  };

  const eliminarProducto = async (id) => {
    const confirmar = confirm("¿Seguro que quieres eliminar este producto?");

    if (!confirmar) return;

    const { error } = await supabase.from("productos").delete().eq("id", id);

    if (error) {
      setMensaje(error.message);
      return;
    }

    cargarProductos();
  };

  if (loading) {
    return <section className="adminPage">Cargando...</section>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (perfil?.rol !== "admin") {
    return (
      <section className="adminPage">
        <h1>Acceso denegado</h1>
        <p>Tu cuenta no tiene permisos de administrador.</p>
      </section>
    );
  }

  return (
    <section className="adminPage">
      <div className="adminHeader">
        <div>
          <span className="authBadge">Panel secreto</span>
          <h1>Panel Admin</h1>
          <p>Agrega productos reales para la tienda.</p>
        </div>
      </div>

      <div className="adminGrid">
        <form className="adminForm" onSubmit={handleSubmit}>
          <h2>Nuevo producto</h2>

          {mensaje && <div className="formMessage success">{mensaje}</div>}

          <label>
            Nombre
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej: Polera Oversize Negra"
            />
          </label>

          <label>
            Descripción
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Descripción del producto"
            />
          </label>

          <label>
            Categoría
            <select
              name="categoria_id"
              value={form.categoria_id}
              onChange={handleChange}
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </label>

          <div className="formTwoColumns">
            <label>
              Precio
              <input
                name="precio"
                type="number"
                value={form.precio}
                onChange={handleChange}
                placeholder="14990"
              />
            </label>

            <label>
              Precio oferta
              <input
                name="precio_oferta"
                type="number"
                value={form.precio_oferta}
                onChange={handleChange}
                placeholder="Opcional"
              />
            </label>
          </div>

          <label>
            Stock
            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              placeholder="10"
            />
          </label>

          <label>
            URL imagen
            <input
              name="imagen_url"
              value={form.imagen_url}
              onChange={handleChange}
              placeholder="https://..."
            />
          </label>

          <div className="checkRow">
            <label>
              <input
                type="checkbox"
                name="destacado"
                checked={form.destacado}
                onChange={handleChange}
              />
              Producto destacado
            </label>

            <label>
              <input
                type="checkbox"
                name="activo"
                checked={form.activo}
                onChange={handleChange}
              />
              Producto activo
            </label>
          </div>

          <button className="primaryBtn authSubmit" type="submit">
            {guardando ? "Guardando..." : "Guardar producto"}
          </button>
        </form>

        <div className="adminTableCard">
          <h2>Productos creados</h2>

          <div className="adminTable">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id}>
                    <td>{producto.nombre}</td>
                    <td>{producto.categorias?.nombre || "Sin categoría"}</td>
                    <td>${producto.precio.toLocaleString("es-CL")}</td>
                    <td>{producto.stock}</td>
                    <td>{producto.activo ? "Activo" : "Oculto"}</td>
                    <td>
                      <button
                        className="deleteBtn"
                        onClick={() => eliminarProducto(producto.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}

                {productos.length === 0 && (
                  <tr>
                    <td colSpan="6">No hay productos todavía.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Admin;