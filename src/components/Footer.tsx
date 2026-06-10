import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-amber-800 text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Marca */}
          <div>
            <h2 className="text-xl font-bold mb-2">Raízes do Nordeste</h2>
            <p className="text-amber-200 text-sm leading-relaxed">
              Sabores autênticos do sertão, feitos com amor e tradição para a sua mesa.
            </p>
          </div>

          {/* Links rápidos */}
          <div>
            <h3 className="font-semibold text-amber-100 mb-3 uppercase tracking-wide text-sm">
              Links Rápidos
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-amber-200 hover:text-white transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/cardapio" className="text-amber-200 hover:text-white transition-colors">
                  Cardápio
                </Link>
              </li>
              <li>
                <Link to="/pedidos" className="text-amber-200 hover:text-white transition-colors">
                  Meus Pedidos
                </Link>
              </li>
              <li>
                <Link to="/fidelidade" className="text-amber-200 hover:text-white transition-colors">
                  Programa de Fidelidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold text-amber-100 mb-3 uppercase tracking-wide text-sm">
              Fale Conosco
            </h3>
            <ul className="space-y-2 text-sm text-amber-200">
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span>(85) 9 9999-0000</span>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span>
                <span>contato@raizesdonordeste.com.br</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span>
                <span>Fortaleza, CE</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-amber-700 mt-8 pt-6 text-center text-amber-300 text-xs">
          © {currentYear} Raízes do Nordeste. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
