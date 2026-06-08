import { useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { StarRating } from '../components/StarRating';
import { productService } from '../services/productService';
import { unitService } from '../services/unitService';
import { isSeasonalActive } from '../utils/seasonal';
import { reviewService } from '../services/reviewService';
import { useCart } from '../contexts/CartContext';

export function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart, clearCartAndAdd } = useCart();
  const [showConflictModal, setShowConflictModal] = useState(false);

  const product = productService.getById(Number(productId));
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="text-xl text-gray-500 mb-6">Produto não encontrado.</p>
          <Link to="/" className="text-amber-600 font-semibold hover:underline">
            ← Voltar ao início
          </Link>
        </main>
      </div>
    );
  }

  // Disponibilidade: usa o contexto de unidade se fornecido
  const unitId = searchParams.get('unit');
  const unit = unitService.getUnit(unitId ?? '');
  const unitEntry = unit?.products.find(up => up.productId === product.id);
  const isAvailable = unitEntry ? unitEntry.available : product.available;

  const seasonalActive = product.seasonal ? isSeasonalActive(product.seasonal) : false;

  const backLabel = unit ? `← ${unit.name}` : '← Início';

  const fmt = (price: number) => `R$ ${price.toFixed(2).replace('.', ',')}`;

  const { average, count } = reviewService.getAverageRating(product.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Voltar */}
        <button
          onClick={() => navigate(-1)}
          className="text-amber-700 hover:text-amber-800 font-semibold text-sm mb-6 flex items-center gap-1 transition-colors cursor-pointer"
        >
          {backLabel}
        </button>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Imagem ampliada */}
          <div className={`${product.bgColor} h-64 flex items-center justify-center relative`}>
            <span className="text-5xl font-bold text-gray-400 select-none">{product.name.charAt(0)}</span>

            {/* Badges sobre a imagem */}
            <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
              {product.featured && (
                <span className="bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
                  Destaque
                </span>
              )}
              {product.seasonal && seasonalActive && (
                <span className={`${product.seasonal.tagColor} text-white text-sm font-bold px-3 py-1 rounded-full shadow`}>
                  {product.seasonal.tag}
                </span>
              )}
            </div>

            {!isAvailable && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-gray-900 text-white text-lg font-bold px-5 py-2 rounded-full">
                  Indisponível no momento
                </span>
              </div>
            )}
          </div>

          {/* Conteúdo */}
          <div className="p-6 space-y-6">
            {/* Título e status */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
                <span className="inline-block mt-1 text-xs font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                  {product.category}
                </span>
              </div>
              <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full ${
                isAvailable
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-600'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                {isAvailable ? 'Disponível' : 'Indisponível'}
              </span>
            </div>

            {/* Avaliação média */}
            {count > 0 && (
              <div className="flex items-center gap-2">
                <StarRating value={Math.round(average)} readonly size="sm" />
                <span className="text-sm font-semibold text-amber-700">{average}</span>
                <span className="text-sm text-gray-400">({count} {count === 1 ? 'avaliação' : 'avaliações'})</span>
              </div>
            )}

            {/* Preço */}
            <p className="text-4xl font-bold text-amber-700">
              {fmt(product.price)}
            </p>

            {/* Unidade de referência */}
            {unit && (
              <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-2">
                Disponibilidade para: <strong>{unit.name} — {unit.city}/{unit.state}</strong>
              </p>
            )}

            {/* Descrição */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Descrição</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Ingredientes / Composição */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Ingredientes / Composição
              </h2>
              <ul className="flex flex-wrap gap-2">
                {product.ingredients.map(ing => (
                  <li
                    key={ing}
                    className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-3 py-1 rounded-full"
                  >
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            {/* Botão */}
            <button
              onClick={() => {
                const result = addToCart(product);
                if (result.conflict) setShowConflictModal(true);
              }}
              disabled={!isAvailable}
              className={`w-full py-4 rounded-xl font-bold text-base transition-colors duration-200 ${
                isAvailable
                  ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isAvailable ? 'Adicionar ao Carrinho' : 'Produto Indisponível'}
            </button>

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
        </div>
      </main>
    </div>
  );
}
