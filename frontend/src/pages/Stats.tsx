import { useEffect, useState } from "react"
import { BarChart2, Users, PlaySquare, Layers, CheckCircle, XCircle, Clock } from "lucide-react"
import { sessionService } from "../services/sessionService"
import { userService } from "../services/userService"
import { deckService } from "../services/deckService"
import { cardService } from "../services/cardService"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Deck } from "../types/game"

import type { Stats } from "../types/game"

const Stats = () => {
  const [stats, setStats] = useState<Stats>({
    totalGames: 0,
    playedGames: 0,
    totalUsers: 0,
    totalDecks: 0,
    totalCards: 0,
    completeCards: 0,
    incompleteCards: 0,
    averageSessionDuration: { hours: 0, minutes: 0, seconds: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const allSessions = await sessionService.getAllSessions()
      const closedSessions = await sessionService.getSessionByStatus("closed")
      const allUsers = await userService.getAllUsers()
      const allDecks = await deckService.getAllDecks()
      const allCards = await cardService.getAllCards()

      // Count complete and incomplete cards
      let completeCards = 0
      let incompleteCards = 0
      for (const card of allCards) {
        try {
          const response = await cardService.isCardComplete(card.cardId.toString())
          if (response) {
            completeCards++
          } else {
            incompleteCards++
          }
        } catch (error) {
          console.error(`Error checking completeness for card ${card.cardId}:`, error)
        }
      }

      // Calculate average session duration
      const durations = closedSessions
        .filter((session) => session.createdAt && session.endedAt)
        .map((session) => {
          const createdAt = new Date(session.createdAt).getTime()
          const endedAt = new Date(session.endedAt).getTime()
          return endedAt - createdAt
        })

      const averageDurationMs =
        durations.length > 0 ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length : 0

      const averageDuration = {
        hours: Math.floor(averageDurationMs / (1000 * 60 * 60)),
        minutes: Math.floor((averageDurationMs % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((averageDurationMs % (1000 * 60)) / 1000),
      }

      // Calculate sessions per month
      const sessionsPerMonth = calculateSessionsPerMonth(allSessions)

      // Calculate card completion rate
      const cardCompletionRate = allCards.length > 0 ? (completeCards / allCards.length) * 100 : 0

      // Calculate session completion rate
      const sessionCompletionRate = allSessions.length > 0 ? (closedSessions.length / allSessions.length) * 100 : 0

      // Get cards by deck
      const cardsByDeck = await getCardsByDeck(allDecks)

      // Simulate user activity (since we don't have this data)
      const userActivity = generateUserActivity()

      setStats({
        totalGames: allSessions.length,
        playedGames: closedSessions.length,
        totalUsers: allUsers.length,
        totalDecks: allDecks.length,
        totalCards: allCards.length,
        completeCards,
        incompleteCards,
        averageSessionDuration: averageDuration,
        sessionsPerMonth,
        cardCompletionRate,
        sessionCompletionRate,
        cardsByDeck,
        userActivity,
      })
    } catch (error) {
      console.error("Error loading stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateSessionsPerMonth = (sessions: any[]) => {
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]
    const sessionsPerMonth = Array(12).fill(0)

    sessions.forEach((session) => {
      if (session.createdAt) {
        const date = new Date(session.createdAt)
        const month = date.getMonth()
        sessionsPerMonth[month]++
      }
    })

    return months.map((month, index) => ({
      month,
      count: sessionsPerMonth[index],
    }))
  }

  const getCardsByDeck = async (decks: Deck[]) => {
    const result = []

    for (const deck of decks) {
      try {
        // Use getAllCards and filter by deckId instead of a non-existent method
        const allCards = await cardService.getAllCards()
        const deckCards = allCards.filter((card: any) => card.deckId === deck.deckId)
        
        result.push({
          deckName: deck.deckName,
          cardCount: deckCards.length,
        })
      } catch (error) {
        console.error(`Error getting cards for deck ${deck.deckId}:`, error)
        result.push({
          deckName: deck.deckName,
          cardCount: 0,
        })
      }
    }

    return result
  }

  const generateUserActivity = () => {
    // Generate simulated user activity for the last 14 days
    const result = []
    const today = new Date()

    for (let i = 13; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      result.push({
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        count: Math.floor(Math.random() * 10) + 1, // Random number between 1-10
      })
    }

    return result
  }

  const StatCard = ({ icon: Icon, title, value, unit = "", description = "" }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <div className="bg-green-100 rounded-full p-3">
          <Icon className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="ml-3 text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-gray-900">
        {typeof value === "number" && !isNaN(value) ? value.toLocaleString("fr-FR") : value}
        {unit && <span className="text-lg font-normal text-gray-500 ml-1">{unit}</span>}
      </p>
      {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
    </div>
  )


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="ml-4 text-gray-600">Chargement des statistiques...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tableau de bord des statistiques</h1>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px">
          {["overview", "sessions", "cards", "users"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === tab
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab === "overview" && "Vue d'ensemble"}
              {tab === "sessions" && "Sessions"}
              {tab === "cards" && "Cartes"}
              {tab === "users" && "Utilisateurs"}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={BarChart2}
              title="Nombre de parties"
              value={stats.totalGames}
              description="Nombre total de sessions créées"
            />
            <StatCard
              icon={PlaySquare}
              title="Parties Jouées"
              value={stats.playedGames}
              description="Sessions terminées avec succès"
            />
            <StatCard
              icon={Users}
              title="Utilisateurs"
              value={stats.totalUsers}
              description="Nombre total d'utilisateurs enregistrés"
            />
            <StatCard icon={Layers} title="Decks" value={stats.totalDecks} description="Nombre total de decks créés" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Activité mensuelle</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.sessionsPerMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4ade80" name="Sessions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition des cartes</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Complètes", value: stats.completeCards },
                        { name: "Incomplètes", value: stats.incompleteCards },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#4ade80" />
                      <Cell fill="#f87171" />
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} cartes`, ""]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "sessions" && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <StatCard icon={BarChart2} title="Sessions totales" value={stats.totalGames} />
            <StatCard icon={PlaySquare} title="Sessions terminées" value={stats.playedGames} />
            <StatCard
              icon={Clock}
              title="Taux de complétion"
              value={stats.sessionCompletionRate?.toFixed(1)}
              unit="%"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Durée moyenne des sessions</h3>
              <div className="flex items-center justify-center h-[200px]">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900">
                    {stats.averageSessionDuration.hours}
                    <span className="text-2xl text-gray-500">h</span>{" "}
                    {stats.averageSessionDuration.minutes}
                    <span className="text-2xl text-gray-500">m</span>{" "}
                    {stats.averageSessionDuration.seconds}
                    <span className="text-2xl text-gray-500">s</span>
                  </div>
                  <p className="text-gray-500 mt-2">Durée moyenne</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Progression des sessions</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.sessionsPerMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#4ade80"
                      name="Sessions"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "cards" && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            <StatCard icon={Layers} title="Cartes totales" value={stats.totalCards} />
            <StatCard icon={CheckCircle} title="Cartes complètes" value={stats.completeCards} />
            <StatCard icon={XCircle} title="Cartes incomplètes" value={stats.incompleteCards} />
            <StatCard
              icon={CheckCircle}
              title="Taux de complétion"
              value={stats.cardCompletionRate?.toFixed(1)}
              unit="%"
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cartes par deck</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.cardsByDeck}
                  layout="vertical"
                  margin={{ left: 120 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="deckName" type="category" width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cardCount" name="Nombre de cartes" fill="#4ade80" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <StatCard icon={Users} title="Utilisateurs totaux" value={stats.totalUsers} />
           
          </div>
        
        </div>
      )}

    </div>
  );
};

export default Stats;