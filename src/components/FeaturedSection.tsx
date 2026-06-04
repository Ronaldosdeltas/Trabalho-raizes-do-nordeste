import { productService } from '../services/productService';
import { isSeasonalActive } from '../utils/seasonal';
import { ProductCard } from './ProductCard';

export function FeaturedSection() {
  const featured = productService.getProducts().filter(
    p => p.featured && (!p.seasonal || isSeasonalActive(p.seasonal))
  );

  return (
    <section className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-amber-800">⭐ Destaques do Nordeste</h2>
        <p className="text-amber-600 text-sm mt-1">Os sabores mais amados da nossa terra</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featured.map(product => (
          <ProductCard key={product.id} product={product} showBadge />
        ))}
      </div>
    </section>
  );
}
