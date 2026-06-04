import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { CategoryFilter } from '../components/CategoryFilter';
import { ProductCard } from '../components/ProductCard';
import { FeaturedSection } from '../components/FeaturedSection';
import { productService } from '../services/productService';
import { isSeasonalActive } from '../utils/seasonal';
import type { Category } from '../types';

export function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [products] = useState(() => productService.getProducts());

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (product.seasonal && !isSeasonalActive(product.seasonal)) return false;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === null || product.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const isFiltering = searchQuery !== '' || activeCategory !== null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Banner de boas-vindas */}
        <section className="bg-gradient-to-r from-amber-700 to-amber-500 rounded-2xl p-8 text-white text-center shadow-lg">
          <h2 className="text-3xl font-bold mb-2">🌵 Bem-vindo ao Raízes do Nordeste!</h2>
          <p className="text-amber-100 text-lg mb-4">Produtos típicos direto do coração do sertão</p>
          <Link
            to="/cardapio"
            className="inline-block bg-white text-amber-700 hover:bg-amber-50 font-bold px-6 py-2 rounded-xl transition-colors"
          >
            Ver Cardápio por Unidade →
          </Link>
        </section>

        {/* Busca e Filtros */}
        <section className="space-y-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <CategoryFilter activeCategory={activeCategory} onSelect={setActiveCategory} />
        </section>

        {/* Destaques do Nordeste */}
        {!isFiltering && <FeaturedSection />}

        {/* Vitrine de produtos */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {activeCategory
                ? activeCategory
                : searchQuery
                ? `Resultados para "${searchQuery}"`
                : 'Todos os Produtos'}
            </h2>
            <span className="text-sm text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full">
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-6xl mb-4">🔍</p>
              <p className="text-xl font-medium mb-1">Nenhum produto encontrado</p>
              <p className="text-sm">Tente buscar por outro nome ou categoria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
