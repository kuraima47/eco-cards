import { Play, Users, BarChart2, Camera } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const features = [
  {
    icon: <Play className="h-8 w-8 text-green-600" />,
    title: "Sessions de Jeu",
    description: "Créez et gérez des sessions de jeu, avec support pour les joueurs en présentiel et à distance."
  },
  {
    icon: <Users className="h-8 w-8 text-green-600" />,
    title: "Mode Hybride",
    description: "Permettez aux joueurs de participer en personne ou en visioconférence."
  },
  {
    icon: <Camera className="h-8 w-8 text-green-600" />,
    title: "Reconnaissance de Cartes",
    description: "Utilisez votre smartphone pour scanner les cartes et automatiser les calculs."
  },
  {
    icon: <BarChart2 className="h-8 w-8 text-green-600" />,
    title: "Statistiques",
    description: "Analysez les données des parties jouées avec des tableaux de bord détaillés."
  }
];

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {message && (
        <div className="mb-8 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {message}
        </div>
      )}

      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Jeu de Sensibilisation aux Transitions Environnementales
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Un outil pédagogique pour comprendre les enjeux environnementaux et l'importance de réduire nos émissions de gaz à effet de serre.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
        {features.map((feature, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-4">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 text-center">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <button 
          onClick={() => navigate('/games')}
          className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Commencer une Partie
        </button>
      </div>
    </div>
  );
};

export default Home;