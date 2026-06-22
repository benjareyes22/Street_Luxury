import ProductCard from "../components/ProductCard.jsx";
import { products, WHATSAPP } from "../data/products.js";

function Home() {
  return (
    <>
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
        <article>Zapatulas</article>
    
      </section>

      <section id="productos" className="productsSection">
        <div className="sectionHeader">
          <span>Catálogo</span>
          <h2>Productos destacados</h2>
        </div>

        <div className="productsGrid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              whatsapp={WHATSAPP}
            />
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
    </>
  );
}

export default Home;