import { Clock, Info, Target, Users } from 'lucide-react';

const Rules = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Règles du Jeu</h1>

      {/* Introduction Section - New */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Info className="h-6 w-6 text-green-600 mt-1" />
            <div className="text-gray-600">
              <h3 className="font-semibold text-gray-900 mb-2">Contexte (15 minutes)</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Présentation de SobrIUT (10 personnes, réunions mensuelles, initiatives vélo, rapport de stage)</li>
                <li>Atelier collaboratif de 1h30 sur le bilan carbone et les objectifs de réduction de l'université</li>
                <li>Explication du bilan carbone : estimation des émissions de gaz à effet de serre en équivalent CO2</li>
                <li>Objectif des Accords de Paris : 2T de CO2 par humain pour 2050 (actuellement 9T/pers dont 1.5T dues au service public)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section - Existing but updated */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Vue d'ensemble</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-3">
            <Clock className="h-6 w-6 text-green-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Format</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>Durée : 1h30</li>
                <li>3 salles en parallèle</li>
                <li>1 animateur + 1 coordinateur par salle</li>
              </ul>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Users className="h-6 w-6 text-green-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Organisation</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>3 groupes de 4 personnes par salle</li>
                <li>Équipes mixtes (BIATSS, enseignants, campus)</li>
                <li>2 animateurs par salle</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Material Section */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Matériel nécessaire</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Un jeu de cartes par table</li>
          <li>Un bilan carbone imprimé (histogramme en A3) par table</li>
          <li>40 jetons empreinte carbone par table</li>
          <li>40 jetons empreinte carbone corrigée par table</li>
          <li>30 jetons acceptabilité par table</li>
          <li>Une fiche de correction des cartes par salle</li>
          <li>Une carte exemple (format A3) par salle</li>
        </ul>
      </section>

      {/* Game Phases Section - Updated with more detail */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Phases de jeu</h2>
        <div className="space-y-6">
          <div className="border-l-4 border-green-600 pl-4">
            <h3 className="font-semibold text-gray-900 mb-2">Phase 1 : Sélection des cartes (35 minutes)</h3>
            <ul className="list-disc list-inside text-gray-600 ml-4">
              <li>Lot 1 - Bâtiment (8 minutes)</li>
              <li>Lot 2 - Achats (5 minutes)</li>
              <li>Lot 3 - Déplacements (7 minutes)</li>
              <li>Lot 4 - Nourriture (5 minutes)</li>
              <li>Lot 5 - Énergie (5 minutes)</li>
              <li>Choix final de 10 cartes maximum et changement de table (5 minutes)</li>
            </ul>
          </div>

          <div className="border-l-4 border-green-600 pl-4">
            <h3 className="font-semibold text-gray-900 mb-2">Phase 2 : Impact CO2 (10 minutes)</h3>
            <p className="text-gray-600">
              Distribution et répartition des jetons d'impact selon les pourcentages de réduction.
              Un jeton représente un pourcentage de réduction.
            </p>
          </div>

          <div className="border-l-4 border-green-600 pl-4">
            <h3 className="font-semibold text-gray-900 mb-2">Phase 3 : Acceptabilité (10 minutes)</h3>
            <p className="text-gray-600">Distribution de 3 jetons maximum par carte :</p>
            <ul className="list-disc list-inside text-gray-600 ml-4">
              <li>1 jeton = pas acceptable par "l'équipe"</li>
              <li>2 jetons = possible d'en débattre</li>
              <li>3 jetons = facilement acceptable</li>
            </ul>
          </div>

          <div className="border-l-4 border-green-600 pl-4">
            <h3 className="font-semibold text-gray-900 mb-2">Phase 4 : Correction et discussion (15 minutes)</h3>
            <ul className="list-disc list-inside text-gray-600 ml-4">
              <li>Vérification des estimations d'impact</li>
              <li>Calcul de l'atteinte de l'objectif de 40% de réduction</li>
              <li>Élimination des cartes avec acceptabilité faible (1 jeton)</li>
              <li>Élimination des cartes avec impact faible (0 ou 1 brique)</li>
              <li>Sélection des 2 meilleures mesures par table</li>
              <li>Proposition finale pour la direction</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Objective Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Objectif</h2>
        <div className="flex items-start space-x-3">
          <Target className="h-6 w-6 text-green-600 mt-1" />
          <div className="text-gray-600">
            <p className="mb-2">En tant que responsable de département :</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Réduire de 40% le bilan carbone de 2022 d'ici 2030</li>
              <li>Maintenir de bonnes relations avec les étudiants, les enseignants, les BIATSS et tous les services qui interagissent avec le département</li>
              <li>Gérer les contraintes et limites :</li>
              <ul className="list-disc list-inside ml-4 mt-2">
                <li>Estimation réaliste de l'adoption des mesures proposées</li>
                <li>Prise en compte des incitations et contraintes existantes</li>
                <li>Attention aux mesures qui ne peuvent pas être cumulées</li>
              </ul>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Rules;