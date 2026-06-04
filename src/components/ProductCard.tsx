import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { isSeasonalActive } from '../utils/seasonal';

interface ProductCardProps {
  product: Product;
  showBadge?: boolean;
  unitId?: string;
}

export function ProductCard({ product, showBadge = false, unitId }: ProductCardProps) {
  const { addToCart } = useCart();
  const isAvailable = product.available;
  const seasonalActive = product.seasonal ? isSeasonalActive(product.seasonal) : false;

  const detailUrl = unitId
    ? `/produto/${product.id}?unit=${unitId}`
    : `/produto/${product.id}`;

  return (
    <div className={`bg-white rounded-2xl shadow-md overflow-hidden transition-shadow duration-300 flex flex-col relative ${isAvailable ? 'hover:shadow-xl' : 'opacity-70'}`}>
      {/* Badges */}
      <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1">
        {(showBadge || product.featured) && (
          <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
            ⭐ Destaque
          </span>
        )}
        {product.seasonal && seasonalActive && (
          <span className={`${product.seasonal.tagColor} text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm`}>
            🎉 {product.seasonal.tag}
          </span>
        )}
      </div>

      {/* Imagem clicável */}
      <Link to={detailUrl} className="block relative">
        <div className={`${product.bgColor} h-40 flex items-center justify-center`}>
          <span className="text-6xl select-none">{product.emoji}</span>
        </div>
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              Indisponível
            </span>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link to={detailUrl} className="hover:text-amber-700 transition-colors">
          <h3 className="font-semibold text-gray-800 text-base mb-1 line-clamp-1">{product.name}</h3>
        </Link>
        <p className="text-xs text-amber-600 mb-2">{product.category}</p>
        <p className="text-amber-700 font-bold text-lg mb-3">
          R$ {product.price.toFixed(2).replace('.', ',')}
        </p>
        <button
          onClick={() => addToCart(product)}
          disabled={!isAvailable}
          className={`mt-auto font-semibold py-2 px-4 rounded-xl transition-colors duration-200 text-sm ${
            isAvailable
              ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isAvailable ? 'Adicionar ao Carrinho' : 'Indisponível'}
        </button>
      </div>
    </div>
  );
}
