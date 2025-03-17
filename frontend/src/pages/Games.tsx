import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Users, Calendar, MapPin, Play, CheckCircle, Clock, XCircle } from "lucide-react";
import { sessionService } from "../services/sessionService";
import { groupService } from "../services/groupService";
import { groupPlayerService } from "../services/groupPlayerService";
import { deckService } from "../services/deckService";
import type { Session, Group, GroupPlayer, GameDeck } from "../types/game";

const SESSION_STATUS = {
  ACTIVE: "active",
  CLOSED: "closed",
  PENDING: "pending"
} as const;

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case SESSION_STATUS.ACTIVE:
      return <Clock className="h-5 w-5 text-blue-500" />;
    case SESSION_STATUS.CLOSED:
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case SESSION_STATUS.PENDING:
      return <XCircle className="h-5 w-5 text-gray-500" />;
    default:
      return null;
  }
};

const Games: React.FC = () => {
  const [sessions, setSessions] = useState<(Session & {
    groups: (Group & { players: GroupPlayer[] })[],
    deck?: GameDeck,
    totalCO2: number
  })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const loadSessionsData = async () => {
      try {
        const sessionsData = await sessionService.getAllSessions();
        const decksData = await deckService.getAllDecks();

        if (!sessionsData?.length) {
          setSessions([]);
          setLoading(false);
          return;
        }

        const sessionsWithData = await Promise.all(
          sessionsData.map(async (session) => {
            const [groups, deck] = await Promise.all([
              groupService.getGroupsBySessionId(session.sessionId),
              deckService.getDeckById(session.deckId.toString())
            ]);

            const groupsWithPlayers = groups?.length ? await Promise.all(
              groups.map(async group => ({
                ...group,
                players: await groupPlayerService.getGroupPlayersByGroupId(group.groupId) ?? []
              }))
            ) : [];

            // Calculate total CO2 from selected cards
            const deckCards = await deckService.getDeckCards(session.deckId.toString());
            const totalCO2 = deckCards.reduce((sum, card) =>
              card.selected ? sum + (card.co2Saved || 0) : sum, 0
            );

            return {
              ...session,
              groups: groupsWithPlayers,
              deck: decksData?.find(d => d.deckId === session.deckId),
              totalCO2
            };
          })
        );

        setSessions(sessionsWithData);
      } catch (error) {
        console.error("Error loading sessions:", error);
        setError("Failed to load sessions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadSessionsData();
  }, []);

  const filteredSessions = sessions.filter(session =>
    statusFilter === "all" || session.status === statusFilter
  );

  const groupedSessions = {
    active: filteredSessions.filter(s => s.status === SESSION_STATUS.ACTIVE),
    pending: filteredSessions.filter(s => s.status === SESSION_STATUS.PENDING),
    closed: filteredSessions.filter(s => s.status === SESSION_STATUS.CLOSED)
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading sessions data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md mx-auto">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Game Sessions</h1>
          <Link
            to="/games/new"
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>New Session</span>
          </Link>
        </div>

        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No game sessions found.</p>
          <p className="text-gray-500">Create a new session to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Game Sessions</h1>
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200"
          >
            <option value="all">All Sessions</option>
            <option value={SESSION_STATUS.ACTIVE}>Active</option>
            <option value={SESSION_STATUS.CLOSED}>Closed</option>
          </select>
          <Link
            to="/games/new"
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>New Session</span>
          </Link>
        </div>
      </div>

      {Object.entries(groupedSessions).map(([status, statusSessions]) =>
        statusSessions.length > 0 && (
          <div key={status} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <StatusIcon status={status} />
              {status.charAt(0).toUpperCase() + status.slice(1)} Sessions
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {statusSessions.map((session) => (
                <div
                  key={session.sessionId}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 truncate">
                        {session.sessionName}
                      </h3>
                      <StatusIcon status={session.status} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-5 w-5 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          {new Date(session.createdAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-5 w-5 mr-2 flex-shrink-0" />
                        <span>{session.groups.length} groups</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          Deck: {session.deck?.deckName || 'Unknown Deck'}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        Total CO2 Reduction: {session.totalCO2.toFixed(2)} tons
                      </div>
                      <div className="text-sm text-gray-500 space-y-1 mt-2">
                        {session.groups.map((group) => (
                          <div
                            key={group.groupId}
                            className="flex justify-between items-center bg-gray-50 p-2 rounded"
                          >
                            <span className="truncate">{group.groupName}</span>
                            <span className="text-gray-400">{group.players.length}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {session.status !== 'closed' && (
                    <div className="mt-4 flex justify-end gap-2">
                      <Link
                        to={`/games/${session.sessionId}`}
                        className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/games/${session.sessionId}/phase/0`}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1"
                      >
                        <Play className="h-4 w-4" />
                        Launch
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Games;