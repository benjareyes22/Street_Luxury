import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Products() {
  const { categoriaSlug } = useParams();

  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orden, setOrden] = useState("recomendados");

  const cargarDatos = async () => {
  setLoading(true);

  const { data: categoriasData } = await supabase
    .from("categorias")
    .select("*")
    .eq("activo", true)
    .order("id", { ascending: true });

  setCategorias(categoriasData || []);

  let query = supabase
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
      destacado,
      activo,
      categorias!inner (
        nombre,
        slug
      )
    `
    )
    .eq("activo", true);

  if (categoriaSlug) {
    query = query.eq("categorias.slug", categoriaSlug);
  }

  const { data: productosData, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) {
    console.log(error);
    setProductos([]);
  } else {
    setProductos(productosData || []);
  }

  setLoading(false);
};

  useEffect(() => {
    cargarDatos();
  }, [categoriaSlug]);

  const categoriaActual = categorias.find(
    (categoria) => categoria.slug === categoriaSlug
  );

  const productosOrdenados = useMemo(() => {
    const copia = [...productos];

    if (orden === "precio-menor") {
      return copia.sort((a, b) => Number(a.precio) - Number(b.precio));
    }

    if (orden === "precio-mayor") {
      return copia.sort((a, b) => Number(b.precio) - Number(a.precio));
    }

    if (orden === "stock") {
      return copia.sort((a, b) => Number(b.stock) - Number(a.stock));
    }

    return copia.sort((a, b) => Number(b.destacado) - Number(a.destacado));
  }, [productos, orden]);

  const formatPrice = (price) => {
    return `$${Number(price).toLocaleString("es-CL")}`;
  };

  return (
    <section className="catalogPage">
      <div className="catalogHeader">
        <span className="authBadge">Catálogo</span>

        <h1>
          {categoriaActual ? categoriaActual.nombre : "Todos los productos"}
        </h1>

        <p>
          Explora la colección disponible de Street Luxury por categoría, precio
          y stock.
        </p>
      </div>

      <div className="catalogLayout">
        <aside className="catalogSidebar">
          <h3>Categorías</h3>

          <div className="categoryMenu">
            <Link
              to="/productos"
              className={!categoriaSlug ? "categoryLink active" : "categoryLink"}
            >
              Todos
            </Link>

            {categorias.map((categoria) => (
              <Link
                key={categoria.id}
                to={`/productos/${categoria.slug}`}
                className={
                  categoria.slug === categoriaSlug
                    ? "categoryLink active"
                    : "categoryLink"
                }
              >
                {categoria.nombre}
              </Link>
            ))}
          </div>

          <div className="deliveryBox">
            <h3>Stock</h3>
            <p>Los productos sin stock aparecerán marcados como agotados.</p>
          </div>
        </aside>

        <div className="catalogContent">
          <div className="catalogToolbar">
            <div>
              <span>{productosOrdenados.length} productos encontrados</span>
            </div>

            <label>
              Ordenar por:
              <select value={orden} onChange={(e) => setOrden(e.target.value)}>
                <option value="recomendados">Recomendados</option>
                <option value="precio-menor">Precio menor</option>
                <option value="precio-mayor">Precio mayor</option>
                <option value="stock">Más stock</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="emptyProducts">Cargando productos...</div>
          ) : productosOrdenados.length === 0 ? (
            <div className="emptyProducts">
              No hay productos en esta categoría todavía.
            </div>
          ) : (
            <div className="catalogGrid">
              {productosOrdenados.map((producto) => (
                <article className="catalogCard" key={producto.id}>
                  <div className="catalogImage">
                    {producto.imagen_url ? (
                      <img src={producto.imagen_url} alt={producto.nombre} />
                    ) : (
                      <span>{producto.categorias?.nombre || "Producto"}</span>
                    )}

                    {producto.stock <= 0 && (
                      <div className="soldOutOverlay">Sin stock</div>
                    )}
                  </div>

                  <div className="catalogInfo">
                    <span className="catalogCategory">
                      {producto.categorias?.nombre || "Sin categoría"}
                    </span>

                    <h3>{producto.nombre}</h3>

                    {producto.descripcion && <p>{producto.descripcion}</p>}

                    <div className="catalogPriceRow">
                      {producto.precio_oferta ? (
                        <>
                          <strong>{formatPrice(producto.precio_oferta)}</strong>
                          <span>{formatPrice(producto.precio)}</span>
                        </>
                      ) : (
                        <strong>{formatPrice(producto.precio)}</strong>
                      )}
                    </div>

                    <div className="catalogStock">
                      {producto.stock > 0 ? (
                        <span className="stockOk">
                          Stock disponible: {producto.stock}
                        </span>
                      ) : (
                        <span className="stockOut">Agotado</span>
                      )}
                    </div>

                    <button
                      className="buyBtn"
                      disabled={producto.stock <= 0}
                      type="button"
                    >
                      {producto.stock > 0 ? "Consultar producto" : "Sin stock"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Products;