import type { Product } from '../types';

const junina: Product['seasonal'] = {
  start: '06-01', end: '06-30', tag: 'Edição Junina', tagColor: 'bg-orange-500',
};
const natal: Product['seasonal'] = {
  start: '12-01', end: '12-31', tag: 'Temporada Natalina', tagColor: 'bg-red-600',
};

export const products: Product[] = [
  // ── Comidas Típicas ───────────────────────────────────────────────────────
  {
    id: 1, name: 'Carne de Sol', price: 45.00, category: 'Comidas Típicas',
    emoji: '', bgColor: 'bg-orange-100', featured: true, available: true,
    description: 'Carne bovina salgada e curada ao sol, especialidade do sertão nordestino. Sabor marcante e textura incomparável.',
    ingredients: ['Carne bovina (contrafilé)', 'Sal grosso'],
  },
  {
    id: 2, name: 'Baião de Dois', price: 35.00, category: 'Comidas Típicas',
    emoji: '', bgColor: 'bg-orange-100', featured: false, available: true,
    description: 'Prato típico nordestino com arroz e feijão-de-corda cozidos juntos, enriquecidos com queijo coalho e charque.',
    ingredients: ['Arroz', 'Feijão-de-corda', 'Queijo coalho', 'Charque', 'Cebola', 'Alho', 'Coentro', 'Sal'],
  },
  {
    id: 3, name: 'Tapioca', price: 12.00, category: 'Comidas Típicas',
    emoji: '', bgColor: 'bg-orange-100', featured: false, available: true,
    description: 'Beiju de goma de mandioca levemente torrado, leve e versátil. Servido com manteiga de garrafa e queijo coalho.',
    ingredients: ['Goma de tapioca (polvilho)', 'Sal', 'Manteiga de garrafa', 'Queijo coalho'],
  },
  {
    id: 4, name: 'Buchada de Bode', price: 28.00, category: 'Comidas Típicas',
    emoji: '', bgColor: 'bg-orange-100', featured: false, available: true,
    description: 'Miúdos de bode temperados com ervas e especiarias do sertão, ensacados no próprio bucho e cozidos lentamente.',
    ingredients: ['Miúdos de bode', 'Bucho de bode', 'Cebola', 'Alho', 'Coentro', 'Pimenta-do-reino', 'Hortelã', 'Sal'],
  },
  {
    id: 5, name: 'Arrumadinho', price: 38.00, category: 'Comidas Típicas',
    emoji: '', bgColor: 'bg-orange-100', featured: false, available: true,
    description: 'Prato montado com feijão-de-corda, charque desfiado, vinagrete, farinha de mandioca e linguiça, servidos separados.',
    ingredients: ['Feijão-de-corda', 'Charque', 'Linguiça', 'Tomate', 'Cebola', 'Coentro', 'Farinha de mandioca'],
  },
  {
    id: 6, name: 'Queijo Coalho', price: 22.00, category: 'Comidas Típicas',
    emoji: '', bgColor: 'bg-orange-100', featured: false, available: true,
    description: 'Queijo artesanal nordestino de textura firme e sabor levemente salgado, grelhado na brasa com orégano.',
    ingredients: ['Leite bovino integral', 'Fermento lático', 'Coagulante enzimático', 'Sal'],
  },
  // ── Bebidas Regionais ─────────────────────────────────────────────────────
  {
    id: 7, name: 'Cajuína', price: 8.00, category: 'Bebidas Regionais',
    emoji: '', bgColor: 'bg-yellow-100', featured: true, available: true,
    description: 'Bebida tipicamente cearense feita do suco clarificado do caju, processado sem conservantes. Sabor suave e naturalmente adocicado.',
    ingredients: ['Suco de caju clarificado', 'Sem conservantes'],
  },
  {
    id: 8, name: 'Umbuzada', price: 10.00, category: 'Bebidas Regionais',
    emoji: '', bgColor: 'bg-yellow-100', featured: false, available: true,
    description: 'Bebida cremosa à base de umbu, fruto nativo da caatinga, batida com leite e açúcar. Nutritiva e refrescante.',
    ingredients: ['Umbu maduro', 'Leite integral', 'Açúcar'],
  },
  {
    id: 9, name: 'Caldo de Cana', price: 6.00, category: 'Bebidas Regionais',
    emoji: '', bgColor: 'bg-yellow-100', featured: false, available: true,
    description: 'Suco fresco da cana-de-açúcar extraído na hora, naturalmente doce e refrescante.',
    ingredients: ['Cana-de-açúcar in natura'],
  },
  {
    id: 10, name: 'Licor de Jenipapo', price: 25.00, category: 'Bebidas Regionais',
    emoji: '', bgColor: 'bg-yellow-100', featured: false, available: true,
    description: 'Licor artesanal produzido com o fruto do jenipapo, nativo do Nordeste. Aroma intenso e sabor único e adocicado.',
    ingredients: ['Jenipapo maduro', 'Álcool de cereais', 'Açúcar', 'Água'],
  },
  // ── Doces ─────────────────────────────────────────────────────────────────
  {
    id: 11, name: 'Cocada', price: 5.00, category: 'Doces',
    emoji: '', bgColor: 'bg-pink-100', featured: false, available: true,
    description: 'Doce tradicional de coco ralado e açúcar cozidos até o ponto certo. Disponível nas versões branca e queimada.',
    ingredients: ['Coco fresco ralado', 'Açúcar cristal', 'Leite condensado'],
  },
  {
    id: 12, name: 'Rapadura', price: 7.00, category: 'Doces',
    emoji: '', bgColor: 'bg-pink-100', featured: false, available: true,
    description: 'Bloco sólido de caldo de cana-de-açúcar não refinado, rico em minerais e com sabor característico do sertão.',
    ingredients: ['Caldo de cana-de-açúcar'],
  },
  {
    id: 13, name: 'Bolo de Rolo', price: 18.00, category: 'Doces',
    emoji: '', bgColor: 'bg-pink-100', featured: true, available: true,
    description: 'Doce pernambucano de massa fininha enrolada com goiabada. Patrimônio Cultural Imaterial de Pernambuco.',
    ingredients: ['Farinha de trigo', 'Ovos', 'Manteiga', 'Açúcar', 'Goiabada'],
  },
  {
    id: 14, name: 'Paçoca', price: 4.00, category: 'Doces',
    emoji: '', bgColor: 'bg-pink-100', featured: false, available: true,
    description: 'Doce de amendoim moído com açúcar e farinha de mandioca, prensado em formato cilíndrico. Clássico nordestino.',
    ingredients: ['Amendoim torrado', 'Açúcar', 'Farinha de mandioca', 'Sal'],
  },
  {
    id: 15, name: 'Pé de Moleque', price: 6.00, category: 'Doces',
    emoji: '', bgColor: 'bg-pink-100', featured: false, available: true,
    description: 'Confeito crocante de amendoim envolto em melado de rapadura caramelizado. Presença garantida nas feiras do Nordeste.',
    ingredients: ['Amendoim', 'Rapadura', 'Açúcar mascavo'],
  },
  // ── Sazonais – Festa Junina (junho) ───────────────────────────────────────
  {
    id: 16, name: 'Canjica', price: 15.00, category: 'Comidas Típicas',
    emoji: '', bgColor: 'bg-orange-100', featured: false, available: true,
    description: 'Milho branco cozido com leite de coco, leite integral, açúcar e canela. O doce mais esperado das festas juninas.',
    ingredients: ['Milho branco', 'Leite integral', 'Leite de coco', 'Açúcar', 'Canela', 'Cravo'],
    seasonal: junina,
  },
  {
    id: 17, name: 'Milho Assado', price: 10.00, category: 'Comidas Típicas',
    emoji: '', bgColor: 'bg-orange-100', featured: false, available: true,
    description: 'Espiga de milho verde assada na brasa, temperada com manteiga de garrafa e sal. Ícone das quadrilhas juninas.',
    ingredients: ['Milho verde', 'Manteiga de garrafa', 'Sal'],
    seasonal: junina,
  },
  {
    id: 18, name: 'Quentão', price: 12.00, category: 'Bebidas Regionais',
    emoji: '', bgColor: 'bg-yellow-100', featured: false, available: true,
    description: 'Bebida quente preparada com cachaça, gengibre, canela, cravo e frutas cítricas. Aquece as noites juninas.',
    ingredients: ['Cachaça', 'Gengibre', 'Canela em pau', 'Cravo', 'Laranja', 'Açúcar mascavo'],
    seasonal: junina,
  },
  {
    id: 19, name: 'Pamonha', price: 14.00, category: 'Comidas Típicas',
    emoji: '', bgColor: 'bg-orange-100', featured: false, available: true,
    description: 'Massa cremosa de milho verde com leite de coco, cozida dentro da própria palha do milho. Tradição das festas do interior.',
    ingredients: ['Milho verde', 'Leite de coco', 'Açúcar', 'Sal', 'Palha de milho'],
    seasonal: junina,
  },
  // ── Sazonais – Natal (dezembro) ───────────────────────────────────────────
  {
    id: 20, name: 'Pão de Mel', price: 8.00, category: 'Doces',
    emoji: '', bgColor: 'bg-pink-100', featured: false, available: true,
    description: 'Bolinho de mel com especiarias natalinas, coberto com chocolate. Sabor reconfortante das festas de fim de ano.',
    ingredients: ['Mel', 'Farinha de trigo', 'Cacau', 'Canela', 'Cravo', 'Chocolate ao leite', 'Ovos'],
    seasonal: natal,
  },
  {
    id: 21, name: 'Rabanada Nordestina', price: 9.00, category: 'Doces',
    emoji: '', bgColor: 'bg-pink-100', featured: false, available: true,
    description: 'Fatia de pão de forma embebida em leite de coco, ovos e rapadura, frita e polvilhada com canela e açúcar.',
    ingredients: ['Pão de forma', 'Leite de coco', 'Ovos', 'Rapadura', 'Canela', 'Óleo de coco'],
    seasonal: natal,
  },
];
