import React, { useEffect, useState } from 'react';
import { BarChart2, Users, PlaySquare, Layers, CheckCircle, XCircle, Clock } from 'lucide-react';
import { sessionService } from '../services/sessionService';
import { userService } from '../services/userService';
import { deckService } from '../services/deckService';
import { categoryService } from '../services/categoryService';
import { cardService } from '../services/cardService';

interface Stats {
  totalGames: number;
  playedGames: number;
  totalUsers: number;
  totalDecks: number;
  // totalCategories: number;
  totalCards: number;
  completeCards: number,
  incompleteCards: number,
  averageSessionDuration: { hours: number; minutes: number; seconds: number; },
}

const Stats = () => {
  const [stats, setStats] = useState<Stats>({
    totalGames: 0,
    playedGames: 0,
    totalUsers: 0,
    totalDecks: 0,
    // totalCategories: 0,
    totalCards: 0,
    completeCards: 0,
    incompleteCards: 0,
    averageSessionDuration: { hours: 0, minutes: 0, seconds: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const allSessions = await sessionService.getAllSessions();
      const closedSessions = await sessionService.getSessionByStatus('closed');
      const allUsers = await userService.getAllUsers();
      const allDecks = await deckService.getAllDecks()
      // const allCategories = await categoryService.getAllCategories();
      const allCards = await cardService.getAllCards();

      let completeCards = 0;
      let incompleteCards = 0;
      for (const card of allCards) {
        const response = await cardService.isCardComplete(card.cardId.toString());
        const isComplete = response.isComplete
        if (isComplete) {
          completeCards++;
        } else {
          incompleteCards++;
        }
      }

      // Calcul de la durée moyenne des sessions
      const durations = closedSessions
        .filter(session => session.createdAt && session.endedAt) // Filtrer les sessions valides
        .map(session => {
          const createdAt = new Date(session.createdAt).getTime();
          const endedAt = new Date(session.endedAt).getTime();
          return endedAt - createdAt; // Durée en millisecondes
        });

      const averageDurationMs = durations.length > 0
        ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length
        : 0;

      // Convertir la durée moyenne en heures, minutes, secondes
      const averageDuration = {
        hours: Math.floor(averageDurationMs / (1000 * 60 * 60)),
        minutes: Math.floor((averageDurationMs % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((averageDurationMs % (1000 * 60)) / 1000),
      };

      setStats({
        totalGames: allSessions.length,
        playedGames: closedSessions.length,
        totalUsers: allUsers.length,
        totalDecks: allDecks.length,
        // totalCategories: allCategories.length,
        totalCards: allCards.length,
        completeCards,
        incompleteCards,
        averageSessionDuration: averageDuration,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, unit = '' }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <div className="bg-green-100 rounded-full p-3">
          <Icon className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="ml-3 text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-gray-900">
        {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        {unit && <span className="text-lg font-normal text-gray-500 ml-1">{unit}</span>}
      </p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Statistiques</h1>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={BarChart2}
            title="Nombre de parties"
            value={stats.totalGames}
          />
          <StatCard
            icon={PlaySquare}
            title="Parties Jouées"
            value={stats.playedGames}
          />
          <StatCard
            icon={Users}
            title="Nombre d'utilisateurs"
            value={stats.totalUsers}
          />
          <StatCard
            icon={Layers}
            title="Nombre de decks"
            value={stats.totalDecks}
          />
          {/* <StatCard
            icon={Users}
            title="Nombre de catégories"
            value={stats.totalCategories}
          /> */}
          <StatCard
            icon={CheckCircle}
            title="Cartes complètes"
            value={stats.completeCards}
          />
          <StatCard
            icon={XCircle}
            title="Cartes incomplètes"
            value={stats.incompleteCards}
          />
          <StatCard
            icon={Clock}
            title="Durée moyenne des sessions"
            value={`${stats.averageSessionDuration.hours}h ${stats.averageSessionDuration.minutes}m ${stats.averageSessionDuration.seconds}s`}
          />
        </div>
      )}
    </div>
  );
};

export default Stats;