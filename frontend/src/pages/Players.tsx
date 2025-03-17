import { useEffect, useState } from 'react';
import { Mail, User, Calendar } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  email: string;
  created_at: string;
  games_played: number;
}

const Players = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      // const { data, error } = await supabase
      //   .from('players')
      //   .select(`
      //     *,
      //     games_played:session_players(count)
      //   `)
      //   .order('name');

      // if (error) throw error;

      // setPlayers(data || []);
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Joueurs</h1>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        </div>
      ) : players.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun joueur trouvé</h3>
          <p className="text-gray-600">Les joueurs seront ajoutés lors de la création des sessions.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <div key={player.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 rounded-full p-3">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="ml-3 text-xl font-semibold text-gray-900">{player.name}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-5 w-5 mr-2" />
                  <span>{player.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>Inscrit le {new Date(player.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="mt-4 bg-green-50 rounded-lg p-3">
                  <p className="text-green-800">
                    <span className="font-semibold">{player.games_played}</span> parties jouées
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Players;