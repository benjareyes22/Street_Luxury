import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import logoLuxury from "../assets/logoluxury.jpeg";

const WHATSAPP = "56933452696";

function Home() {
  const { perfil } = useAuth();
  const esAdmin = perfil?.rol === "admin";

  const [productosDestacados, setProductosDestacados] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarProductosDestacados = async () => {
    setLoading(true);

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
        destacado,
        activo,
        categorias!inner (
          nombre,
          slug
        )
      `
      )
      .eq("activo", true)
      .eq("destacado", true)
      .order("created_at", { ascending: false })
      .limit(4);

    if (error) {
      console.log(error);
      setProductosDestacados([]);
    } else {
      setProductosDestacados(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    cargarProductosDestacados();
  }, []);

  const formatPrice = (price) => {
    return `$${Number(price).toLocaleString("es-CL")}`;
  };

  const whatsappGeneral = () => {
    const texto = "Hola, quiero consultar por productos de Street Luxury";
    return `https://api.whatsapp.com/send?phone=${WHATSAPP}&text=${encodeURIComponent(
      texto
    )}`;
  };

  return (
    <>
      <section id="inicio" className="hero">
        <div className="heroText">
          <span className="badge">Pura Moda Jefe</span>

          <h1>Ropa urbana con estilo premium</h1>

          <p>
            Encuentra poleras, polerones, pantalones, zapatillas y accesorios
            con diseño urbano, cómodo y moderno.
          </p>

          <div className="heroButtons">
            <Link to="/productos" className="primaryBtn">
              Ver catálogo
            </Link>

            <a
              href={whatsappGeneral()}
              target="_blank"
              rel="noreferrer"
              className="secondaryBtn"
            >
              Hablar por WhatsApp
            </a>
          </div>
        </div>

        <div className="heroCard">
          <div className="shirtPreview brandPreview">
            <img src={logoLuxury} alt="Street Luxury" />
          </div>

          <p>Drop exclusivo</p>
          <h3>Street Luxury</h3>
        </div>
      </section>

      <section className="categories">
        <Link to="/productos/poleras">Poleras</Link>
        <Link to="/productos/polerones">Polerones</Link>
        <Link to="/productos/pantalones">Pantalones</Link>
        <Link to="/productos/zapatillas">Zapatillas</Link>
        <Link to="/productos/accesorios">Accesorios</Link>
      </section>

      <section id="productos" className="productsSection">
        <div className="sectionHeader">
          <span>Catálogo</span>
          <h2>Productos destacados</h2>
        </div>

        {loading ? (
          <div className="emptyProducts">Cargando productos destacados...</div>
        ) : productosDestacados.length === 0 ? (
          <div className="emptyProducts">
            {esAdmin ? (
              <>
                Todavía no hay productos destacados.
                <br />
                Márcalos desde el panel admin.
                <br />
                <Link to="/admin" className="emptyAdminLink">
                  Ir al panel admin
                </Link>
              </>
            ) : (
              "Pronto tendremos productos destacados disponibles."
            )}
          </div>
        ) : (
          <div className="productsGrid">
            {productosDestacados.map((producto) => (
              <article className="productCard" key={producto.id}>
                <div className="productImage">
                  {producto.imagen_url ? (
                    <img src={producto.imagen_url} alt={producto.nombre} />
                  ) : (
                    <span>{producto.categorias?.nombre || "Producto"}</span>
                  )}

                  {producto.stock <= 0 && (
                    <div className="soldOutOverlay">Sin stock</div>
                  )}
                </div>

                <div className="productInfo">
                  <div className="productTop">
                    <span className="productTag">
                      {producto.categorias?.nombre || "Producto"}
                    </span>

                    <span className="productPrice">
                      {producto.precio_oferta
                        ? formatPrice(producto.precio_oferta)
                        : formatPrice(producto.precio)}
                    </span>
                  </div>

                  <h3>{producto.nombre}</h3>

                  <p>
                    {producto.stock > 0
                      ? `Stock disponible: ${producto.stock}`
                      : "Producto agotado"}
                  </p>

                  <Link
                    to={`/producto/${producto.slug || producto.id}`}
                    className="buyBtn"
                  >
                    Ver producto
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="contacto" className="contact">
        <h2>¿Quieres comprar o consultar stock?</h2>
        <p>Escríbenos directo por WhatsApp y te respondemos rápido.</p>

        <a
          href={whatsappGeneral()}
          target="_blank"
          rel="noreferrer"
          className="primaryBtn"
        >
          Contactar ahora
        </a>
      </section>
    </>
  );
}

export default Home;