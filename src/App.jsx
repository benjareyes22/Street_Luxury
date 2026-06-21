import "./App.css";

const WHATSAPP = "569XXXXXXXX"; // cambia esto por el número de tu primo

const products = [
  {
    id: 1,
    name: "Polera Oversize Negra",
    category: "Poleras",
    price: "$14.990",
    tag: "Nuevo",
  },
  {
    id: 2,
    name: "Polerón Street Luxury",
    category: "Polerones",
    price: "$29.990",
    tag: "Más vendido",
  },
  {
    id: 3,
    name: "Cargo Pants Beige",
    category: "Pantalones",
    price: "$24.990",
    tag: "Oferta",
  },
  {
    id: 4,
    name: "Chaqueta Urban",
    category: "Chaquetas",
    price: "$39.990",
    tag: "Premium",
  },
];

function App() {
  const buyMessage = (productName) => {
    const text = `Hola, quiero consultar por el producto: ${productName}`;
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
  };

  return (
    <main className="page">
      <header className="navbar">
        <div className="logo">Street_Luxury</div>

        <nav>
          <a href="#inicio">Inicio</a>
          <a href="#productos">Productos</a>
          <a href="#contacto">Contacto</a>
        </nav>
      </header>

      <section id="inicio" className="hero">
        <div className="heroText">
          <span className="badge">Nueva colección 2026</span>
          <h1>Ropa urbana con estilo premium</h1>
          <p>
            Encuentra poleras, polerones, cargos y chaquetas con diseño urbano,
            cómodo y moderno.
          </p>

          <div className="heroButtons">
            <a href="#productos" className="primaryBtn">
              Ver catálogo
            </a>
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noreferrer"
              className="secondaryBtn"
            >
              Hablar por WhatsApp
            </a>
          </div>
        </div>

        <div className="heroCard">
          <div className="shirtPreview">STREET</div>
          <p>Drop exclusivo</p>
          <h3>Urban Essentials</h3>
        </div>
      </section>

      <section className="categories">
        <article>Poleras</article>
        <article>Polerones</article>
        <article>Pantalones</article>
        <article>Chaquetas</article>
      </section>

      <section id="productos" className="productsSection">
        <div className="sectionHeader">
          <span>Catálogo</span>
          <h2>Productos destacados</h2>
        </div>

        <div className="productsGrid">
          {products.map((product) => (
            <article className="productCard" key={product.id}>
              <div className="productImage">
                <span>{product.category}</span>
              </div>

              <div className="productInfo">
                <div className="productTop">
                  <span className="productTag">{product.tag}</span>
                  <span className="productPrice">{product.price}</span>
                </div>

                <h3>{product.name}</h3>
                <p>{product.category}</p>

                <a
                  href={buyMessage(product.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="buyBtn"
                >
                  Consultar por WhatsApp
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="contacto" className="contact">
        <h2>¿Quieres comprar o consultar stock?</h2>
        <p>Escríbenos directo por WhatsApp y te respondemos rápido.</p>

        <a
          href={`https://wa.me/${WHATSAPP}`}
          target="_blank"
          rel="noreferrer"
          className="primaryBtn"
        >
          Contactar ahora
        </a>
      </section>

      <footer>
        <p>© 2026 Street_Luxury. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}

export default App;