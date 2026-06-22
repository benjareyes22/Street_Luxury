function ProductCard({ product, whatsapp }) {
  const text = `Hola, quiero consultar por el producto: ${product.name}`;
  const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
    text
  )}`;

  return (
    <article className="productCard">
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
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="buyBtn"
        >
          Consultar por WhatsApp
        </a>
      </div>
    </article>
  );
}

export default ProductCard;