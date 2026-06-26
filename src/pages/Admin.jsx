import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import "../App.css";
import "./Admin.css";

const initialForm = {
  nombre: "",
  descripcion: "",
  categoria_id: "",
  precio: "",
  precio_oferta: "",
  stock: "",
  imagen_url: "",
  imagenes_extra: "",
  destacado: false,
  activo: true,
};

const crearVarianteVacia = () => ({
  talla: "",
  color: "",
  stock: "",
});

const getInitialVariantes = () => [
  crearVarianteVacia(),
  crearVarianteVacia(),
  crearVarianteVacia(),
  crearVarianteVacia(),
];

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
  const [variantes, setVariantes] = useState(getInitialVariantes());
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("success");
  const [guardando, setGuardando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);

  const cargarCategorias = async () => {
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .eq("activo", true)
      .order("id", { ascending: true });

    if (!error) {
      setCategorias(data || []);
    }
  };

  const cargarProductos = async () => {
    const { data, error } = await supabase
      .from("productos")
      .select(
        `
        id,
        nombre,
        slug,
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
      setProductos(data || []);
    }
  };

  useEffect(() => {
    if (perfil?.rol === "admin") {
      cargarCategorias();
      cargarProductos();
    }
  }, [perfil]);

  const mostrarMensaje = (texto, tipo = "success") => {
    setMensaje(texto);
    setTipoMensaje(tipo);
  };

  const limpiarFormulario = () => {
    setForm(initialForm);
    setVariantes(getInitialVariantes());
    setProductoEditando(null);
  };

  const abrirNuevoProducto = () => {
    mostrarMensaje("");
    limpiarFormulario();
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    limpiarFormulario();
    setGuardando(false);
  };

  const abrirEditarProducto = async (producto) => {
    mostrarMensaje("");
    setProductoEditando(producto);

    setForm({
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      categoria_id: producto.categoria_id || "",
      precio: producto.precio || "",
      precio_oferta: producto.precio_oferta || "",
      stock: producto.stock || "",
      imagen_url: producto.imagen_url || "",
      imagenes_extra: "",
      destacado: producto.destacado || false,
      activo: producto.activo ?? true,
    });

    const { data: variantesData } = await supabase
      .from("producto_variantes")
      .select("*")
      .eq("producto_id", producto.id)
      .order("id", { ascending: true });

    if (variantesData && variantesData.length > 0) {
      setVariantes(
        variantesData.map((variante) => ({
          talla: variante.talla || "",
          color: variante.color || "",
          stock: variante.stock ?? "",
        }))
      );
    } else {
      setVariantes(getInitialVariantes());
    }

    const { data: imagenesData } = await supabase
      .from("producto_imagenes")
      .select("*")
      .eq("producto_id", producto.id)
      .order("orden", { ascending: true });

    if (imagenesData && imagenesData.length > 0) {
      const urlsExtra = imagenesData
        .map((imagen) => imagen.imagen_url)
        .filter((url) => url && url !== producto.imagen_url);

      setForm((prev) => ({
        ...prev,
        imagenes_extra: urlsExtra.join("\n"),
      }));
    }

    setModalAbierto(true);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleVarianteChange = (index, campo, valor) => {
    const nuevasVariantes = [...variantes];

    nuevasVariantes[index] = {
      ...nuevasVariantes[index],
      [campo]: valor,
    };

    setVariantes(nuevasVariantes);
  };

  const agregarVariante = () => {
    setVariantes([...variantes, crearVarianteVacia()]);
  };

  const eliminarVariante = (index) => {
    if (variantes.length <= 1) {
      setVariantes([crearVarianteVacia()]);
      return;
    }

    setVariantes(variantes.filter((_, i) => i !== index));
  };

  const obtenerVariantesValidas = () => {
    return variantes
      .filter(
        (variante) =>
          variante.talla.trim() !== "" &&
          variante.stock !== "" &&
          variante.stock !== null
      )
      .map((variante) => ({
        talla: variante.talla.trim().toUpperCase(),
        color: variante.color.trim() || "Sin color",
        stock: Number(variante.stock || 0),
      }));
  };

  const calcularStockFinal = () => {
    const variantesValidas = obtenerVariantesValidas();

    if (variantesValidas.length > 0) {
      return variantesValidas.reduce(
        (total, variante) => total + Number(variante.stock || 0),
        0
      );
    }

    return Number(form.stock || 0);
  };

  const obtenerImagenes = () => {
    const urls = [
      form.imagen_url,
      ...form.imagenes_extra
        .split("\n")
        .map((url) => url.trim())
        .filter(Boolean),
    ].filter(Boolean);

    return [...new Set(urls)];
  };

  const guardarVariantes = async (productoId, variantesValidas) => {
    await supabase
      .from("producto_variantes")
      .delete()
      .eq("producto_id", productoId);

    if (variantesValidas.length === 0) return null;

    const variantesPayload = variantesValidas.map((variante) => ({
      producto_id: productoId,
      talla: variante.talla,
      color: variante.color,
      stock: variante.stock,
    }));

    const { error } = await supabase
      .from("producto_variantes")
      .insert(variantesPayload);

    return error;
  };

  const guardarImagenes = async (productoId, nombreProducto) => {
    await supabase
      .from("producto_imagenes")
      .delete()
      .eq("producto_id", productoId);

    const imagenes = obtenerImagenes();

    if (imagenes.length === 0) return null;

    const imagenesPayload = imagenes.map((url, index) => ({
      producto_id: productoId,
      imagen_url: url,
      alt_text: nombreProducto,
      es_principal: index === 0,
      orden: index + 1,
    }));

    const { error } = await supabase
      .from("producto_imagenes")
      .insert(imagenesPayload);

    return error;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    mostrarMensaje("");

    if (!form.nombre || !form.categoria_id || !form.precio) {
      mostrarMensaje("Completa nombre, categoría y precio.", "error");
      return;
    }

    const variantesValidas = obtenerVariantesValidas();
    const stockFinal = calcularStockFinal();

    if (stockFinal < 0) {
      mostrarMensaje("El stock no puede ser negativo.", "error");
      return;
    }

    setGuardando(true);

    const productoPayload = {
      nombre: form.nombre,
      slug:
        productoEditando?.slug || `${crearSlug(form.nombre)}-${Date.now()}`,
      descripcion: form.descripcion || null,
      categoria_id: Number(form.categoria_id),
      precio: Number(form.precio),
      precio_oferta: form.precio_oferta ? Number(form.precio_oferta) : null,
      stock: stockFinal,
      imagen_url: form.imagen_url || null,
      destacado: form.destacado,
      activo: form.activo,
    };

    let productoGuardado = null;
    let productoError = null;

    if (productoEditando) {
      const { data, error } = await supabase
        .from("productos")
        .update(productoPayload)
        .eq("id", productoEditando.id)
        .select()
        .single();

      productoGuardado = data;
      productoError = error;
    } else {
      const { data, error } = await supabase
        .from("productos")
        .insert(productoPayload)
        .select()
        .single();

      productoGuardado = data;
      productoError = error;
    }

    if (productoError) {
      setGuardando(false);
      mostrarMensaje(productoError.message, "error");
      return;
    }

    const variantesError = await guardarVariantes(
      productoGuardado.id,
      variantesValidas
    );

    if (variantesError) {
      setGuardando(false);
      mostrarMensaje(variantesError.message, "error");
      return;
    }

    const imagenesError = await guardarImagenes(
      productoGuardado.id,
      form.nombre
    );

    if (imagenesError) {
      setGuardando(false);
      mostrarMensaje(imagenesError.message, "error");
      return;
    }

    setGuardando(false);
    setModalAbierto(false);
    limpiarFormulario();
    cargarProductos();

    mostrarMensaje(
      productoEditando
        ? "Producto actualizado correctamente."
        : "Producto guardado correctamente."
    );
  };

  const actualizarStock = async (producto, cantidad) => {
    const nuevoStock = Math.max(0, Number(producto.stock) + cantidad);

    const { error } = await supabase
      .from("productos")
      .update({ stock: nuevoStock })
      .eq("id", producto.id);

    if (error) {
      mostrarMensaje(error.message, "error");
      return;
    }

    setProductos((prev) =>
      prev.map((item) =>
        item.id === producto.id ? { ...item, stock: nuevoStock } : item
      )
    );
  };

  const eliminarProducto = async (id) => {
    const confirmar = confirm("¿Seguro que quieres eliminar este producto?");

    if (!confirmar) return;

    const { error } = await supabase.from("productos").delete().eq("id", id);

    if (error) {
      mostrarMensaje(error.message, "error");
      return;
    }

    mostrarMensaje("Producto eliminado correctamente.");
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
        <span className="authBadge">Panel secreto</span>
        <h1>Panel Admin</h1>
        <p>Agrega productos reales para la tienda.</p>
      </div>

      {mensaje && (
        <div className={`formMessage ${tipoMensaje}`}>{mensaje}</div>
      )}

      <div className="adminTopActions">
        <button
          className="adminCreateBtn"
          type="button"
          onClick={abrirNuevoProducto}
        >
          + Nuevo producto
        </button>
      </div>

      <div className="adminGrid adminGridSingle">
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
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id}>
                    <td>{producto.nombre}</td>
                    <td>{producto.categorias?.nombre || "Sin categoría"}</td>
                    <td>${Number(producto.precio).toLocaleString("es-CL")}</td>

                    <td>
                      <div className="stockControl">
                        <button
                          type="button"
                          className="stockBtn stockMinus"
                          onClick={() => actualizarStock(producto, -1)}
                          disabled={producto.stock <= 0}
                        >
                          -
                        </button>

                        <strong>{producto.stock}</strong>

                        <button
                          type="button"
                          className="stockBtn stockPlus"
                          onClick={() => actualizarStock(producto, 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td>
                      {producto.stock <= 0 ? (
                        <span className="stockBadge sinStock">Sin stock</span>
                      ) : (
                        <span className="stockBadge conStock">Activo</span>
                      )}
                    </td>

                    <td>
                      <div className="adminActions">
                        <button
                          className="editBtn"
                          type="button"
                          onClick={() => abrirEditarProducto(producto)}
                        >
                          Editar
                        </button>

                        <button
                          className="deleteBtn"
                          type="button"
                          onClick={() => eliminarProducto(producto.id)}
                        >
                          Eliminar
                        </button>
                      </div>
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

      {modalAbierto && (
        <div className="modalOverlay">
          <div className="adminModal">
            <div className="adminModalHeader">
              <h2>
                {productoEditando ? "Editar producto" : "Nuevo producto"}
              </h2>

              <button type="button" onClick={cerrarModal}>
                ×
              </button>
            </div>

            {mensaje && (
              <div className={`formMessage ${tipoMensaje}`}>{mensaje}</div>
            )}

            <form className="adminForm" onSubmit={handleSubmit}>
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
                Stock general
                <input
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="Opcional si usas tallas"
                />
              </label>

              <label>
                URL imagen principal
                <input
                  name="imagen_url"
                  value={form.imagen_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </label>

              <label>
                Fotos extra
                <textarea
                  name="imagenes_extra"
                  value={form.imagenes_extra}
                  onChange={handleChange}
                  placeholder={`Una URL por línea\nhttps://foto-1.jpg\nhttps://foto-2.jpg`}
                />
              </label>

              <div className="adminVariantBox">
                <div className="adminVariantHeader">
                  <h3>Tallas y stock</h3>

                  <button
                    type="button"
                    className="smallAdminBtn"
                    onClick={agregarVariante}
                  >
                    + Agregar talla
                  </button>
                </div>

                <p>
                  Si agregas tallas con stock, el stock total se calcula
                  automáticamente desde aquí.
                </p>

                <div className="variantRows">
                  {variantes.map((variante, index) => (
                    <div className="variantRow" key={index}>
                      <input
                        value={variante.talla}
                        onChange={(e) =>
                          handleVarianteChange(index, "talla", e.target.value)
                        }
                        placeholder="Talla"
                      />

                      <input
                        value={variante.color}
                        onChange={(e) =>
                          handleVarianteChange(index, "color", e.target.value)
                        }
                        placeholder="Color"
                      />

                      <input
                        type="number"
                        value={variante.stock}
                        onChange={(e) =>
                          handleVarianteChange(index, "stock", e.target.value)
                        }
                        placeholder="Stock"
                      />

                      <button
                        type="button"
                        className="removeVariantBtn"
                        onClick={() => eliminarVariante(index)}
                        disabled={variantes.length <= 1}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

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

              <button
                className="primaryBtn authSubmit"
                type="submit"
                disabled={guardando}
              >
                {guardando
                  ? "Guardando..."
                  : productoEditando
                  ? "Guardar cambios"
                  : "Guardar producto"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Admin;