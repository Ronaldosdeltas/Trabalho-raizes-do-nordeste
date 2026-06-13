import { useState, useMemo, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { productService } from '../services/productService';
import { unitService } from '../services/unitService';
import { isSeasonalActive } from '../utils/seasonal';
import { useCart } from '../contexts/CartContext';
import type { Category } from '../types';

const categories: Category[] = ['Comidas Típicas', 'Bebidas Regionais', 'Doces'];

export function Menu() {
  const { unitId } = useParams<{ unitId: string }>();
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [products] = useState(() => productService.getProducts());
  const { setCurrentUnit } = useCart();

  const unit = unitService.getUnit(unitId ?? '');
  if (!unit) return <Navigate to="/cardapio" replace />;

  // Inform cart of selected unit
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setCurrentUnit(unit.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit.id]);

  // Mapa de disponibilidade por unidade
  const unitAvailMap = new Map(unit.products.map(up => [up.productId, up.available]));

  // Produtos da unidade: filtrar sazonais inativos, aplicar disponibilidade da unidade
  const menuProducts = useMemo(() => {
    return products
      .filter(p => {
        if (!unitAvailMap.has(p.id)) return false;
        if (p.seasonal && !isSeasonalActive(p.seasonal)) return false;
        return true;
      })
      .map(p => ({ ...p, available: unitAvailMap.get(p.id) ?? true }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit.id, products]);

  const seasonalProducts = menuProducts.filter(p => p.seasonal);

  const categoriesInMenu = categories.filter(cat =>
    menuProducts.some(p => p.category === cat)
  );

  const filtered = useMemo(() => {
    return menuProducts.filter(p =>
      !activeCategory || p.category === activeCategory
    );
  }, [menuProducts, activeCategory]);

  const nonSeasonalFiltered = filtered.filter(p => !p.seasonal);
  const seasonalFiltered = filtered.filter(p => p.seasonal);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Cabeçalho da unidade */}
        <section className={`${unit.bgColor} border border-gray-200 rounded-2xl p-6`}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{unit.name}</h2>
                <p className="text-amber-700 font-semibold">{unit.city} – {unit.state}</p>
                <p className="text-sm text-gray-500 mt-1">{unit.address}</p>
                <p className="text-sm text-gray-500">{unit.phone}</p>
              </div>
            </div>
            <Link
              to="/cardapio"
              className="text-amber-700 hover:text-amber-800 text-sm font-semibold transition-colors"
            >
              ← Trocar unidade
            </Link>
          </div>
        </section>

        {/* Especiais de Temporada */}
        {seasonalProducts.length > 0 && (!activeCategory || seasonalFiltered.length > 0) && (
          <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
            <h3 className="text-xl font-bold mb-1">
              {seasonalProducts[0].seasonal!.tag}
            </h3>
            <p className="text-orange-100 text-sm mb-5">
              Disponíveis apenas nesta época — aproveite enquanto dura!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {seasonalFiltered.map(product => (
                <ProductCard key={product.id} product={product} unitId={unit.id} />
              ))}
            </div>
          </section>
        )}

        {/* Filtro por categoria */}
        <section className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 cursor-pointer border ${
                activeCategory === null
                  ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-amber-400'
              }`}
            >
              Todos
            </button>
            {categoriesInMenu.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 cursor-pointer border ${
                  activeCategory === cat
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-amber-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Grade de produtos não-sazonais */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-gray-800">
              {activeCategory ?? 'Todos os Itens'}
            </h3>
            <span className="text-sm text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full">
              {nonSeasonalFiltered.length} item{nonSeasonalFiltered.length !== 1 ? 'ns' : ''}
            </span>
          </div>

          {nonSeasonalFiltered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">Nenhum item nesta categoria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {nonSeasonalFiltered.map(product => (
                <ProductCard key={product.id} product={product} unitId={unit.id} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
