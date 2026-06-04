import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { units } from '../data/units';

export function UnitSelection() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">Nosso Cardápio</h2>
          <p className="text-gray-500 mt-2">Selecione uma unidade para ver o cardápio disponível</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {units.map(unit => (
            <Link
              key={unit.id}
              to={`/cardapio/${unit.id}`}
              className={`${unit.bgColor} border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex flex-col gap-4`}
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl">{unit.emoji}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{unit.name}</h3>
                  <p className="text-amber-700 font-semibold text-sm">
                    {unit.city} – {unit.state}
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <p className="flex items-start gap-2">
                  <span className="text-base">📍</span>
                  {unit.address}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-base">📞</span>
                  {unit.phone}
                </p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  {unit.products.length} itens no cardápio
                </span>
                <span className="text-amber-700 font-semibold text-sm">
                  Ver cardápio →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
