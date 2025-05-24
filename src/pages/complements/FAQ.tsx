import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: 'Reservas',
    question: 'Como faço uma reserva?',
    answer: "Fazer uma reserva é fácil! Basta usar nossa ferramenta de simulação para selecionar seu destino desejado, datas e preferências. Siga o processo passo a passo para escolher seus voos, hospedagem e atividades. Quando estiver satisfeito com suas seleções, prossiga para o checkout e confirme sua reserva."
  },
  {
    category: 'Reservas',
    question: 'Posso modificar ou cancelar minha reserva?',
    answer: 'Sim, você pode modificar ou cancelar sua reserva através do painel da sua conta. Observe que as políticas de modificação e cancelamento variam dependendo do fornecedor do serviço. Recomendamos revisar os termos e condições específicos antes de fazer qualquer alteração.'
  },
  {
    category: 'Pagamento',
    question: 'Quais formas de pagamento vocês aceitam?',
    answer: 'Aceitamos todos os principais cartões de crédito (Visa, MasterCard, American Express), cartões de débito e pagamentos via PIX. Todas as transações são processadas com segurança através do nosso gateway de pagamento.'
  },
  {
    category: 'Pagamento',
    question: 'É seguro pagar através do site?',
    answer: 'Sim, absolutamente! Utilizamos criptografia SSL padrão da indústria para proteger suas informações de pagamento. Nosso sistema de processamento de pagamento está em conformidade com os requisitos PCI DSS para garantir o mais alto nível de segurança.'
  },
  {
    category: 'Viagem',
    question: 'Preciso de visto para visitar o Brasil?',
    answer: 'Os requisitos de visto dependem da sua nacionalidade. Muitos países têm acordos de isenção de visto com o Brasil para visitas turísticas de até 90 dias. Recomendamos verificar com a embaixada brasileira em seu país para obter as informações mais atualizadas.'
  },
  {
    category: 'Viagem',
    question: "Qual a melhor época para visitar o Brasil?",
    answer: 'O Brasil é um destino para o ano todo, mas a melhor época para visitar depende das suas preferências e destino. Geralmente, os meses de verão (dezembro a março) são populares para destinos de praia, enquanto os meses de inverno (junho a setembro) oferecem temperaturas mais amenas e menos chuva em muitas regiões.'
  },
  {
    category: 'Conta',
    question: 'Como crio uma conta?',
    answer: "Clique no botão \"Registrar\" na barra de navegação superior e preencha o formulário de registro com seu endereço de e-mail e senha. Você receberá um e-mail de confirmação para verificar sua conta."
  },
  {
    category: 'Conta',
    question: 'Esqueci minha senha. O que devo fazer?',
    answer: "Clique no botão \"Login\" e selecione \"Esqueci a Senha\". Digite seu endereço de e-mail e enviaremos instruções para redefinir sua senha."
  }
];

export function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="relative overflow-hidden bg-blue-600 text-white">
        <div className="absolute inset-0 bg-[url()] bg-cover bg-center">
          <div className="absolute inset-0 bg-blue-900/70 mix-blend-multiply" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Perguntas Frequentes</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mb-8">
            Encontre respostas para perguntas comuns sobre o uso do TravelSim.
          </p>


        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                {openItems.includes(index) ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {openItems.includes(index) && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>


      </div>
    </div>
  );
}