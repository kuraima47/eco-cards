import React, { useEffect, useState } from 'react';
import { BarChart2, Users, PlaySquare, Clock } from 'lucide-react';

interface Stats {
  totalGames: number;
  totalPlayers: number;
  averageGameDuration: number;
  totalPlayTime: number;
}

const Stats = () => {
  const [stats, setStats] = useState<Stats>({
    totalGames: 0,
    totalPlayers: 0,
    averageGameDuration: 0,
    totalPlayTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // const [gamesCount, playersCount, gameStats] = await Promise.all([
      //   supabase
      //     .from('game_sessions')
      //     .select('id', { count: 'exact' }),
      //   supabase
      //     .from('players')
      //     .select('id', { count: 'exact' }),
      //   supabase
      //     .from('game_sessions')
      //     .select('started_at, ended_at')
      //     .not('ended_at', 'is', null)
      // ]);

      const totalGames = gamesCount.count || 0;
      const totalPlayers = playersCount.count || 0;
      
      let totalDuration = 0;
      let completedGames = 0;

      if (gameStats.data) {
        gameStats.data.forEach(game => {
          if (game.started_at && game.ended_at) {
            const duration = new Date(game.ended_at).getTime() - new Date(game.started_at).getTime();
            totalDuration += duration;
            completedGames++;
          }
        });
      }

      setStats({
        totalGames,
        totalPlayers,
        averageGameDuration: completedGames ? totalDuration / completedGames / (1000 * 60) : 0,
        totalPlayTime: totalDuration / (1000 * 60)
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
            icon={PlaySquare}
            title="Parties Jouées"
            value={stats.totalGames}
          />
          <StatCard
            icon={Users}
            title="Joueurs Total"
            value={stats.totalPlayers}
          />
          <StatCard
            icon={Clock}
            title="Durée Moyenne"
            value={Math.round(stats.averageGameDuration)}
            unit="min"
          />
          <StatCard
            icon={BarChart2}
            title="Temps de Jeu Total"
            value={Math.round(stats.totalPlayTime)}
            unit="min"
          />
        </div>
      )}
    </div>
  );
};

export default Stats;