import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

const WHATSAPP = "56933452696";

function ProductDetail() {
  const { productoSlug } = useParams();

  const [producto, setProducto] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [imagenActiva, setImagenActiva] = useState("");
  const [tallaSeleccionada, setTallaSeleccionada] = useState("");
  const [loading, setLoading] = useState(true);

  const cargarProducto = async () => {
    setLoading(true);

    let query = supabase
      .from("productos")
      .select(
        `
        id,
        categoria_id,
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
      .eq("activo", true);

    if (/^\d+$/.test(productoSlug)) {
      query = query.eq("id", Number(productoSlug));
    } else {
      query = query.eq("slug", productoSlug);
    }

    const { data, error } = await query.single();

    if (error) {
      console.log(error);
      setProducto(null);
      setLoading(false);
      return;
    }

    setProducto(data);

    const { data: imagenesData } = await supabase
      .from("producto_imagenes")
      .select("*")
      .eq("producto_id", data.id)
      .order("orden", { ascending: true });

    const imagenesFinales =
      imagenesData && imagenesData.length > 0
        ? imagenesData
        : data.imagen_url
        ? [
            {
              id: "principal",
              producto_id: data.id,
              imagen_url: data.imagen_url,
              alt_text: data.nombre,
              es_principal: true,
              orden: 1,
            },
          ]
        : [];

    setImagenes(imagenesFinales);
    setImagenActiva(imagenesFinales[0]?.imagen_url || "");

    const { data: variantesData } = await supabase
      .from("producto_variantes")
      .select("*")
      .eq("producto_id", data.id)
      .order("id", { ascending: true });

    setVariantes(variantesData || []);

    const primeraTallaDisponible = variantesData?.find(
      (variante) => Number(variante.stock) > 0
    );

    if (primeraTallaDisponible) {
      setTallaSeleccionada(primeraTallaDisponible.talla);
    }

    setLoading(false);
  };

  useEffect(() => {
    cargarProducto();
  }, [productoSlug]);

  const formatPrice = (price) => {
    return `$${Number(price).toLocaleString("es-CL")}`;
  };

  const precioFinal = useMemo(() => {
    if (!producto) return "";

    return producto.precio_oferta
      ? formatPrice(producto.precio_oferta)
      : formatPrice(producto.precio);
  }, [producto]);

  const stockTotal = useMemo(() => {
    if (variantes.length > 0) {
      return variantes.reduce(
        (total, variante) => total + Number(variante.stock || 0),
        0
      );
    }

    return Number(producto?.stock || 0);
  }, [variantes, producto]);

  const varianteSeleccionada = variantes.find(
    (variante) => variante.talla === tallaSeleccionada
  );

  const puedeConsultar =
    stockTotal > 0 &&
    (variantes.length === 0 ||
      (varianteSeleccionada && Number(varianteSeleccionada.stock) > 0));

  const whatsappProducto = () => {
    const texto = [
      `Hola, quiero consultar por el producto: ${producto.nombre}`,
      variantes.length > 0 && tallaSeleccionada
        ? `Talla: ${tallaSeleccionada}`
        : null,
      `Precio: ${precioFinal}`,
    ]
      .filter(Boolean)
      .join("\n");

    return `https://api.whatsapp.com/send?phone=${WHATSAPP}&text=${encodeURIComponent(
      texto
    )}`;
  };

  if (loading) {
    return (
      <section className="productDetailPage">
        <div className="emptyProducts">Cargando producto...</div>
      </section>
    );
  }

  if (!producto) {
    return (
      <section className="productDetailPage">
        <div className="emptyProducts">
          Producto no encontrado.
          <br />
          <Link to="/productos">Volver al catálogo</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="productDetailPage">
      <Link className="backToCatalog" to="/productos">
        ← Volver al catálogo
      </Link>

      <div className="productDetailGrid">
        <div className="productGallery">
          <div className="productMainImage">
            {imagenActiva ? (
              <img src={imagenActiva} alt={producto.nombre} />
            ) : (
              <span>{producto.categorias?.nombre || "Producto"}</span>
            )}

            {stockTotal <= 0 && <div className="soldOutOverlay">Sin stock</div>}
          </div>

          {imagenes.length > 1 && (
            <div className="productThumbs">
              {imagenes.map((imagen) => (
                <button
                  key={imagen.id}
                  type="button"
                  className={
                    imagen.imagen_url === imagenActiva
                      ? "productThumb active"
                      : "productThumb"
                  }
                  onClick={() => setImagenActiva(imagen.imagen_url)}
                >
                  <img src={imagen.imagen_url} alt={imagen.alt_text || producto.nombre} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="productDetailInfo">
          <span className="catalogCategory">
            {producto.categorias?.nombre || "Producto"}
          </span>

          <h1>{producto.nombre}</h1>

          <div className="detailPriceRow">
            {producto.precio_oferta ? (
              <>
                <strong>{formatPrice(producto.precio_oferta)}</strong>
                <span>{formatPrice(producto.precio)}</span>
              </>
            ) : (
              <strong>{formatPrice(producto.precio)}</strong>
            )}
          </div>

          <div className="detailStock">
            {stockTotal > 0 ? (
              <span className="stockOk">Stock disponible: {stockTotal}</span>
            ) : (
              <span className="stockOut">Agotado</span>
            )}
          </div>

          {producto.descripcion && (
            <div className="detailDescription">
              <h3>Descripción</h3>
              <p>{producto.descripcion}</p>
            </div>
          )}

          <div className="detailSizes">
            <h3>Tallas disponibles</h3>

            {variantes.length === 0 ? (
              <p className="mutedText">
                Este producto aún no tiene tallas registradas.
              </p>
            ) : (
              <div className="sizeOptions">
                {variantes.map((variante) => (
                  <button
                    key={variante.id}
                    type="button"
                    disabled={Number(variante.stock) <= 0}
                    className={
                      tallaSeleccionada === variante.talla
                        ? "sizeButton active"
                        : "sizeButton"
                    }
                    onClick={() => setTallaSeleccionada(variante.talla)}
                  >
                    <strong>{variante.talla}</strong>
                    <small>
                      {Number(variante.stock) > 0
                        ? `${variante.stock} disp.`
                        : "Agotado"}
                    </small>
                  </button>
                ))}
              </div>
            )}
          </div>

          <a
            href={puedeConsultar ? whatsappProducto() : undefined}
            target="_blank"
            rel="noreferrer"
            className={`detailWhatsappBtn ${!puedeConsultar ? "disabledBtn" : ""}`}
          >
            {puedeConsultar
              ? "Consultar este producto por WhatsApp"
              : "Producto sin stock"}
          </a>
        </div>
      </div>
    </section>
  );
}

export default ProductDetail;