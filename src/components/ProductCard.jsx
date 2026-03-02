// Presentational component for a product item
export default function ProductCard({ product, view = "grid" }) {
  const { title, brand, category, price, thumbnail, rating } = product;
  return (
    <div className={`card ${view}`}>
      <img src={thumbnail} alt={title} className="thumb" loading="lazy" />
      <div className="info">
        <h3 className="title">{title}</h3>
        <p className="muted">
          {brand} • {category}
        </p>
        <div className="row">
          <span className="price">${price}</span>
          <span className="rating">⭐ {rating}</span>
        </div>
      </div>
    </div>
  );
}
