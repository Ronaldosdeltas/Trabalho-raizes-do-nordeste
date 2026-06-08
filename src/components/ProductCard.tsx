import { useState } from 'react';
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
  const { addToCart, clearCartAndAdd } = useCart();
  const [showConflictModal, setShowConflictModal] = useState(false);
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
            Destaque
          </span>
        )}
        {product.seasonal && seasonalActive && (
          <span className={`${product.seasonal.tagColor} text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm`}>
            {product.seasonal.tag}
          </span>
        )}
      </div>

      {/* Imagem clicável */}
      <Link to={detailUrl} className="block relative">
        <div className={`${product.bgColor} h-40 flex items-center justify-center`}>
          <span className="text-3xl font-bold text-gray-500 select-none">{product.name.charAt(0)}</span>
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
          onClick={() => {
            const result = addToCart(product);
            if (result.conflict) setShowConflictModal(true);
          }}
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

      {showConflictModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h2 className="font-bold text-gray-800 text-lg mb-2">Carrinho de outra unidade</h2>
            <p className="text-gray-600 text-sm mb-5">
              Seu carrinho contém itens de outra unidade. Deseja limpar o carrinho e adicionar este produto?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConflictModal(false)}
                className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  clearCartAndAdd(product);
                  setShowConflictModal(false);
                }}
                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-colors"
              >
                Limpar e adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
