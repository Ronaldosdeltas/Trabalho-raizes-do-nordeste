import type { Category } from '../types';

interface CategoryFilterProps {
  activeCategory: Category | null;
  onSelect: (category: Category | null) => void;
}

const categories: Category[] = ['Comidas Típicas', 'Bebidas Regionais', 'Doces'];

export function CategoryFilter({ activeCategory, onSelect }: CategoryFilterProps) {
  const baseStyle = 'px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 cursor-pointer border';
  const activeStyle = 'bg-amber-600 text-white border-amber-600 shadow-md';
  const inactiveStyle = 'bg-white text-gray-600 border-gray-200 hover:border-amber-400 hover:text-amber-700';

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => onSelect(null)}
        className={`${baseStyle} ${activeCategory === null ? activeStyle : inactiveStyle}`}
      >
        Todos
      </button>
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`${baseStyle} ${activeCategory === cat ? activeStyle : inactiveStyle}`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
