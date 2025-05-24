import { Briefcase, MapPin } from 'lucide-react';

const openings = [
  {
    title: 'Desenvolvedor Full Stack Sênior',
    department: 'Engenharia',
    location: 'São Paulo ou Remoto',
    type: 'Tempo Integral'
  },
  {
    title: 'Product Manager',
    department: 'Produto',
    location: 'Rio de Janeiro ou Remoto',
    type: 'Tempo Integral'
  },
  {
    title: 'Especialista em Sucesso do Cliente',
    department: 'Suporte ao Cliente',
    location: 'São Paulo',
    type: 'Tempo Integral'
  },
  {
    title: 'Gerente de Marketing',
    department: 'Marketing',
    location: 'Remoto',
    type: 'Tempo Integral'
  }
];

export function Careers() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">Junte-se à Nossa Equipe</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl">
            Ajude-nos a revolucionar o planejamento de viagens no Brasil. Estamos procurando pessoas apaixonadas para se juntar à nossa equipe em crescimento.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Vagas Abertas</h2>
          <div className="space-y-4">
            {openings.map((job) => (
              <div
                key={job.title}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-gray-600 mb-4">{job.department}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        {job.type}
                      </div>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Candidatar-se
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}