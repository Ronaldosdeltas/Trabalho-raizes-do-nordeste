import { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../contexts/AdminContext';
import { productService } from '../../services/productService';
import { unitService } from '../../services/unitService';
import type { Product, Category } from '../../types';

type FormData = Omit<Product, 'id'>;

const CATEGORIES: Category[] = ['Comidas Típicas', 'Bebidas Regionais', 'Doces'];

const BG_OPTIONS = [
  { label: 'Âmbar', value: 'bg-amber-100' },
  { label: 'Verde', value: 'bg-green-100' },
  { label: 'Azul', value: 'bg-blue-100' },
  { label: 'Laranja', value: 'bg-orange-100' },
  { label: 'Rosa', value: 'bg-pink-100' },
  { label: 'Amarelo', value: 'bg-yellow-100' },
  { label: 'Roxo', value: 'bg-purple-100' },
  { label: 'Vermelho', value: 'bg-red-100' },
  { label: 'Ciano', value: 'bg-cyan-100' },
];

const TAG_COLORS = [
  { label: 'Laranja', value: 'bg-orange-500' },
  { label: 'Vermelho', value: 'bg-red-600' },
  { label: 'Verde', value: 'bg-green-600' },
  { label: 'Azul', value: 'bg-blue-600' },
];

const emptyForm = (): FormData => ({
  name: '',
  price: 0,
  category: 'Comidas Típicas',
  emoji: '🍽️',
  bgColor: 'bg-amber-100',
  featured: false,
  description: '',
  ingredients: [],
  available: true,
});

const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

export function AdminProducts() {
  const { currentAdmin } = useAdmin();
  const [products, setProducts] = useState(() => productService.getProducts());
  const [units] = useState(() => unitService.getUnits());

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [ingredientInput, setIngredientInput] = useState('');
  const [hasSeasonal, setHasSeasonal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const refresh = () => setProducts(productService.getProducts());
  const flash = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setIngredientInput('');
    setHasSeasonal(false);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: p.price,
      category: p.category,
      emoji: p.emoji,
      bgColor: p.bgColor,
      featured: p.featured,
      description: p.description,
      ingredients: [...p.ingredients],
      available: p.available,
      seasonal: p.seasonal,
    });
    setIngredientInput('');
    setHasSeasonal(!!p.seasonal);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || form.price <= 0) return;
    const finalForm = { ...form, seasonal: hasSeasonal ? form.seasonal : undefined };
    if (editingId !== null) {
      productService.updateProduct({ ...finalForm, id: editingId });
      flash('Produto atualizado com sucesso!');
    } else {
      productService.addProduct(finalForm);
      flash('Produto adicionado com sucesso!');
    }
    refresh();
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Deseja excluir este produto?')) return;
    productService.deleteProduct(id);
    refresh();
    flash('Produto excluído.');
  };

  const toggleGlobalAvail = (p: Product) => {
    productService.updateProduct({ ...p, available: !p.available });
    refresh();
  };

  const toggleUnitAvail = (unitId: string, productId: number, current: boolean) => {
    unitService.setProductAvailability(unitId, productId, !current);
    refresh();
  };

  const addIngredient = () => {
    const val = ingredientInput.trim();
    if (!val) return;
    setForm(f => ({ ...f, ingredients: [...f.ingredients, val] }));
    setIngredientInput('');
  };

  const removeIngredient = (i: number) =>
    setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) }));

  const setF = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm text-gray-700';

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
            <p className="text-gray-500 text-sm mt-1">{products.length} produto{products.length !== 1 ? 's' : ''} no catálogo</p>
          </div>
          <button
            onClick={openAdd}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
          >
            + Novo Produto
          </button>
        </div>

        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
            ✅ {successMsg}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 text-lg">
              {editingId !== null ? 'Editar Produto' : 'Novo Produto'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nome *</label>
                <input type="text" value={form.name} onChange={e => setF('name', e.target.value)} className={inputCls} placeholder="Nome do produto" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Preço (R$) *</label>
                <input type="number" min="0" step="0.01" value={form.price} onChange={e => setF('price', parseFloat(e.target.value) || 0)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Categoria</label>
                <select value={form.category} onChange={e => setF('category', e.target.value as Category)} className={inputCls}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Emoji</label>
                <input type="text" value={form.emoji} onChange={e => setF('emoji', e.target.value)} className={inputCls} placeholder="🍽️" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Cor de fundo</label>
                <select value={form.bgColor} onChange={e => setF('bgColor', e.target.value)} className={inputCls}>
                  {BG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col justify-end gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setF('featured', e.target.checked)} className="w-4 h-4 accent-amber-600" />
                  <span className="text-sm text-gray-700">Produto em destaque</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.available} onChange={e => setF('available', e.target.checked)} className="w-4 h-4 accent-amber-600" />
                  <span className="text-sm text-gray-700">Disponível</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Descrição</label>
              <textarea value={form.description} onChange={e => setF('description', e.target.value)} rows={2} className={inputCls} placeholder="Descreva o produto..." />
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ingredientes</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={ingredientInput}
                  onChange={e => setIngredientInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                  className={inputCls + ' flex-1'}
                  placeholder="Digite e pressione Enter"
                />
                <button onClick={addIngredient} className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer">
                  Adicionar
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {form.ingredients.map((ing, i) => (
                  <span key={i} className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    {ing}
                    <button onClick={() => removeIngredient(i)} className="text-amber-500 hover:text-red-500 cursor-pointer font-bold">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Seasonal */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input type="checkbox" checked={hasSeasonal} onChange={e => setHasSeasonal(e.target.checked)} className="w-4 h-4 accent-amber-600" />
                <span className="text-sm font-medium text-gray-700">Produto sazonal</span>
              </label>
              {hasSeasonal && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-amber-50 rounded-xl p-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Início (MM-DD)</label>
                    <input type="text" value={form.seasonal?.start ?? ''} onChange={e => setF('seasonal', { ...form.seasonal!, start: e.target.value })} className={inputCls} placeholder="06-01" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Fim (MM-DD)</label>
                    <input type="text" value={form.seasonal?.end ?? ''} onChange={e => setF('seasonal', { ...form.seasonal!, end: e.target.value })} className={inputCls} placeholder="07-31" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tag</label>
                    <input type="text" value={form.seasonal?.tag ?? ''} onChange={e => setF('seasonal', { ...form.seasonal!, tag: e.target.value })} className={inputCls} placeholder="Edição Junina" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Cor da tag</label>
                    <select value={form.seasonal?.tagColor ?? 'bg-orange-500'} onChange={e => setF('seasonal', { ...form.seasonal!, tagColor: e.target.value })} className={inputCls}>
                      {TAG_COLORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-2.5 rounded-xl text-sm cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={!form.name.trim() || form.price <= 0} className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors cursor-pointer">
                {editingId !== null ? 'Salvar Alterações' : 'Adicionar Produto'}
              </button>
            </div>
          </div>
        )}

        {/* Products table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Produto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Categoria</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Preço</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Disponível</th>
                  {currentAdmin?.role === 'admin' && (
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Unidades</th>
                  )}
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => {
                  return (
                    <tr key={p.id} className={`hover:bg-gray-50 ${!p.available ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{p.emoji}</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                            {p.featured && <span className="text-xs text-amber-600">⭐ Destaque</span>}
                            {p.seasonal && <span className="text-xs text-orange-500 ml-1">🎉 Sazonal</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{p.category}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right">{fmt(p.price)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleGlobalAvail(p)}
                          className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${p.available ? 'bg-green-500' : 'bg-gray-300'}`}
                          title={p.available ? 'Clique para ocultar' : 'Clique para ativar'}
                        >
                          <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${p.available ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </td>
                      {currentAdmin?.role === 'admin' && (
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-center flex-wrap">
                            {units.map(u => {
                              const entry = u.products.find(up => up.productId === p.id);
                              const avail = entry?.available ?? false;
                              return (
                                <button
                                  key={u.id}
                                  onClick={() => toggleUnitAvail(u.id, p.id, avail)}
                                  title={`${u.city}: ${avail ? 'disponível' : 'indisponível'}`}
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer transition-colors ${
                                    avail ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                                  }`}
                                >
                                  {u.emoji}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => openEdit(p)}
                            className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded-xl font-medium cursor-pointer transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-xl font-medium cursor-pointer transition-colors"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
