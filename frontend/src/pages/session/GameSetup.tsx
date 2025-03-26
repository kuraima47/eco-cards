import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Plus, ChevronRight, ChevronLeft, X, Loader } from "lucide-react"
import { sessionService } from "../../services/sessionService"
import { deckService } from "../../services/deckService"
import { userService } from "../../services/userService"
import { groupService } from "../../services/groupService"
import { groupPlayerService } from "../../services/groupPlayerService"
import type { Session, GameDeck, User, Group, GroupPlayer } from "../../types/game"

const GameSetup: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [processingAction, setProcessingAction] = useState<string | null>(null)
  const [session, setSession] = useState<Partial<Session>>({
    sessionName: "",
    deckId: undefined,
    adminId: 1,
  })
  const [decks, setDecks] = useState<GameDeck[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [groups, setGroups] = useState<(Group & { players: GroupPlayer[] })[]>([])
  const [step, setStep] = useState(1)
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [groupErrors, setGroupErrors] = useState<Record<number, string>>({})
  const [tempIdCounter, setTempIdCounter] = useState(-1)
  const [guestUsernames, setGuestUsernames] = useState<Record<number, string | undefined>>({})
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Trigger a refresh of groups data
  const refreshGroups = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const [decksData, usersData] = await Promise.all([deckService.getAllDecks(), userService.getAllUsers()])

        setDecks(decksData ?? [])

        if (id) {
          const sessionData = await sessionService.getSessionById(id)
          if (!sessionData) throw new Error("Session not found")
          setSession(sessionData)

          const groupsData = await groupService.getGroupsBySessionId(Number(id))
          if (groupsData?.length) {
            const groupsWithPlayers = await Promise.all(
              groupsData.map(async (group) => ({
                ...group,
                players: (await groupPlayerService.getGroupPlayersByGroupId(group.groupId)) ?? [],
              })),
            )
            setGroups(groupsWithPlayers)

            // Exclure les utilisateurs déjà assignés à des groupes
            const assignedUserIds = groupsWithPlayers.flatMap((group) => group.players.map((player) => player.userId))
            setUsers(usersData.filter((user) => !assignedUserIds.includes(user.userId)))
          } else {
            setUsers(usersData ?? [])
          }
        } else {
          setUsers(usersData ?? [])
        }
      } catch (error) {
        console.error("Error loading data:", error)
        setError("Failed to load data. Please check console for details.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, refreshTrigger]) 

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setSession((prev) => ({
      ...prev,
      [name]: name === "deckId" ? (value ? Number(value) : undefined) : value,
    }))
  }

  const handleNextStep = () => {
    if (step === 1 && (!session.sessionName || !session.deckId)) {
      setError("Please fill in all required fields")
      return
    }
    setError(null)
    setStep((prev) => Math.min(prev + 1, 2))
  }

  const handlePreviousStep = () => {
    setError(null)
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const handleAddGroup = () => {
    const newGroup: Group & { players: GroupPlayer[] } = {
      groupId: tempIdCounter,
      sessionId: Number(id) || 0,
      groupName: `Groupe ${groups.length + 1}`,
      players: [],
    }
    setTempIdCounter((prev) => prev - 1)
    setGroups((prev) => [...prev, newGroup])
    setGuestUsernames((prev) => ({ ...prev, [newGroup.groupId]: "" }))
  }

  const handleRemoveGroup = async (groupId: number) => {
    try {
      setProcessingAction(`Suppression du groupe ${groupId}`)

      if (groupId > 0 && id) {
        const groupToDelete = groups.find((g) => g.groupId === groupId)
        if (groupToDelete?.players.length) {
          await Promise.all(
            groupToDelete.players.map((player) => groupPlayerService.deleteGroupPlayer(groupId, player.username)),
          )
        }
        await groupService.deleteGroup(groupId)
      }

      setGroups((prev) => prev.filter((g) => g.groupId !== groupId))
      setGroupErrors((prev) => {
        const { [groupId]: _, ...rest } = prev
        return rest
      })
      setGuestUsernames((prev) => {
        const newUsernames = { ...prev }
        delete newUsernames[groupId]
        return newUsernames
      })
    } catch (error) {
      console.error(`Error deleting group ${groupId}:`, error)
      setGroupErrors((prev) => ({
        ...prev,
        [groupId]: `Echec dans la suppression du groupe : ${error instanceof Error ? error.message : "Erreur inconnue"}`,
      }))
    } finally {
      setProcessingAction(null)
    }
  }

  const handleAddPlayersToGroup = (groupId: number, userIds: number[]) => {
    if (!userIds.length) return

    const validUsers = users.filter((user) => user.userId && userIds.includes(user.userId))

    setGroups((prev) =>
      prev.map((group) =>
        group.groupId === groupId
          ? {
              ...group,
              players: [
                ...group.players,
                ...validUsers.map((user) => ({
                  groupId,
                  userId: user.userId,
                  username: user.username,
                })),
              ],
            }
          : group,
      ),
    )

    // Retirer les utilisateurs ajoutés de la liste des utilisateurs disponibles
    setUsers((prev) => prev.filter((user) => !userIds.includes(user.userId)))

    setSelectedUsers([])
  }

  const handleAddGuestToGroup = async (groupId: number) => {
    const username = guestUsernames[groupId]?.trim();
    if (!username) return;
  
    try {
      setProcessingAction(`Ajout de l'invité ${username}`);
  
      // Always add guest to the group in state, like normal players.
      setGroups((prev) =>
        prev.map((group) =>
          group.groupId === groupId
            ? {
                ...group,
                players: [
                  ...group.players,
                  {
                    groupId,
                    username,
                    userId: undefined,
                  },
                ],
              }
            : group,
        ),
      );
  
      // If session exists, also handle the guest on the backend.
      if (id) {
        await sessionService.sendLink(id, username);
        await groupPlayerService.createGroupPlayer({
          groupId: groupId,
          username: username,
          userId: undefined,
        });
        // Refresh the groups data to show the new player
        refreshGroups();
      }
  
      // Clear the guest input field.
      setGuestUsernames((prev) => ({ ...prev, [groupId]: "" }));
    } catch (error) {
      console.error(`Error adding guest ${username}:`, error);
      setGroupErrors((prev) => ({
        ...prev,
        [groupId]: `Echec de l'ajout de l'invité : ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`,
      }));
    } finally {
      setProcessingAction(null);
    }
  };
  

  const handleRemovePlayerFromGroup = async (groupId: number, username: string) => {
    try {
      setProcessingAction(`Removing ${username} from group ${groupId}`)

      if (groupId > 0 && id) {
        await groupPlayerService.deleteGroupPlayer(groupId, username)
      }

      setGroups((prev) =>
        prev.map((group) =>
          group.groupId === groupId
            ? {
                ...group,
                players: group.players.filter((p) => p.username !== username),
              }
            : group,
        ),
      )
    } catch (error) {
      console.error(`Error removing ${username}:`, error)
      setGroupErrors((prev) => ({
        ...prev,
        [groupId]: `Echec de la suppression du joueur : ${error instanceof Error ? error.message : "Erreur inconnue"}`,
      }))
    } finally {
      setProcessingAction(null)
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)
      setGroupErrors({})

      if (!session.sessionName || !session.deckId) {
        throw new Error("Session name and deck are required")
      }

      let sessionId: number
      setProcessingAction("Sauvegarde de la session")
      if (id) {
        await sessionService.updateSession(id, session as Session)
        sessionId = Number(id)
      } else {
        const newSession = await sessionService.createSession(session as Session)
        if (!newSession?.sessionId) throw new Error("Failed to create session")
        sessionId = newSession.sessionId

        // Send invitations to guests added during creation
        setProcessingAction("Envoi des invitations aux invités")
        const guestsToInvite = groups.flatMap((group) =>
          group.players.filter((player) => !player.userId).map((player) => ({ email: player.username, sessionId })),
        )

        for (const guest of guestsToInvite) {
          await sessionService.sendLink(guest.sessionId.toString(), guest.email)
        }
      }

      setProcessingAction("Traitement des groupes")
      const updatedGroups = await Promise.all(
        groups.map(async (group) => {
          let groupId = group.groupId

          if (group.groupId < 0) {
            const newGroup = await groupService.createGroup({
              sessionId,
              groupName: group.groupName,
            })
            if (!newGroup?.groupId) throw new Error("Failed to create group")
            groupId = newGroup.groupId
          } else {
            await groupService.updateGroup(groupId, {
              groupName: group.groupName,
              sessionId,
            })
          }

          return {
            ...group,
            groupId,
            players: group.players.map((p) => ({ ...p, groupId })),
          }
        }),
      )

      for (const group of updatedGroups) {
        const existingPlayers = await groupPlayerService.getGroupPlayersByGroupId(group.groupId)

        const playersToAdd = group.players.filter((p) => !existingPlayers.some((ep) => ep.username === p.username))
        const playersToRemove = existingPlayers.filter((ep) => !group.players.some((p) => p.username === ep.username))

        await Promise.all([
          ...playersToAdd.map((p) =>
            groupPlayerService.createGroupPlayer({
              groupId: group.groupId,
              username: p.username,
              userId: p.userId ?? undefined,
            }),
          ),
          ...playersToRemove.map((p) => groupPlayerService.deleteGroupPlayer(group.groupId, p.username)),
        ])
      }

      navigate(`/games/${sessionId}/phase/0`)
    } catch (error) {
      console.error("Error saving session:", error)
      setError(`Echec de la sauvegarde de la session : ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    } finally {
      setLoading(false)
      setProcessingAction(null)
    }
  }

  if (loading && !processingAction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
        <p className="ml-4 text-gray-600">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">
          {id ? `Modifier la session: ${session.sessionName}` : "Créer une nouvelle session"}
        </h1>

        {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

        {processingAction && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded flex items-center">
            <Loader className="animate-spin h-5 w-5 mr-3" />
            <span>{processingAction}...</span>
          </div>
        )}

        {step === 1 ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Étape 1 : Détails de la session</h2>
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nom de la session
                  <input
                    type="text"
                    name="sessionName"
                    value={session.sessionName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200"
                    required
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sélection du deck
                  <select
                    name="deckId"
                    value={session.deckId ?? ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200"
                    required
                  >
                    <option value="">Sélection du deck...</option>
                    {decks.map((deck) => (
                      <option key={deck.deckId} value={deck.deckId}>
                        {deck.deckName}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <button
              onClick={handleNextStep}
              disabled={!session.sessionName || !session.deckId || !!processingAction}
              className="mt-6 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Suivant
              <ChevronRight className="inline-block ml-2" />
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">Étape 2 : Paramétrage du groupe</h2>
            <button
              onClick={handleAddGroup}
              disabled={!!processingAction}
              className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <Plus className="inline-block mr-2" />
              Ajouter un groupe (table)
            </button>

            {groups.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélection des joueurs à ajouter aux groupes
                  <select
                    multiple
                    value={selectedUsers.map(String)}
                    onChange={(e) => setSelectedUsers(Array.from(e.target.selectedOptions, (o) => Number(o.value)))}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200"
                    disabled={!!processingAction}
                  >
                    {users.map((user) => (
                      <option key={user.userId} value={user.userId}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="text-sm text-gray-500 mt-1">Maintenez Ctrl/Cmd pour sélectionner plusieurs joueurs</p>
              </div>
            )}

            {groups.length === 0 && (
              <div className="text-center p-8 bg-gray-50 rounded-md">
                <p className="text-gray-500">Aucun groupe n'a encore été créé</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <div key={group.groupId} className="p-4 border rounded-md bg-white shadow-sm">
                  {groupErrors[group.groupId] && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
                      {groupErrors[group.groupId]}
                    </div>
                  )}

                  <div className="flex justify-between items-center mb-4">
                    <input
                      type="text"
                      value={group.groupName}
                      onChange={(e) =>
                        setGroups((prev) =>
                          prev.map((g) => (g.groupId === group.groupId ? { ...g, groupName: e.target.value } : g)),
                        )
                      }
                      className="text-lg font-medium border border-gray-200 rounded px-2 focus:border-green-300 focus:ring-1 focus:ring-green-200 w-full"
                      placeholder="Nom du groupe"
                      disabled={!!processingAction}
                    />
                    <button
                      onClick={() => handleRemoveGroup(group.groupId)}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 ml-2"
                      disabled={!!processingAction}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={() => handleAddPlayersToGroup(group.groupId, selectedUsers)}
                      disabled={!selectedUsers.length || !!processingAction}
                      className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      Ajouter les joueurs sélectionnés
                    </button>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={guestUsernames[group.groupId] || ""}
                        onChange={(e) =>
                          setGuestUsernames((prev) => ({
                            ...prev,
                            [group.groupId]: e.target.value,
                          }))
                        }
                        className="flex-1 rounded-md border border-gray-300 shadow-sm p-2"
                        placeholder="Adresse email de l'invité"
                      />
                      <button
                        onClick={() => handleAddGuestToGroup(group.groupId)}
                        disabled={!guestUsernames[group.groupId]?.trim() || !!processingAction}
                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Ajouter
                      </button>
                    </div>

                    {group.players.length === 0 ? (
                      <p className="text-sm text-gray-500 italic text-center">Aucun joueur dans ce groupe</p>
                    ) : (
                      <ul className="space-y-2">
                        {group.players.map((player) => (
                          <li
                            key={`${group.groupId}-${player.username}`}
                            className="flex justify-between items-center bg-gray-50 p-2 rounded"
                          >
                            <div>
                              {player.username}
                              {!player.userId && <span className="ml-2 text-xs text-gray-500">(guest)</span>}
                            </div>
                            <button
                              onClick={() => handleRemovePlayerFromGroup(group.groupId, player.username)}
                              className="text-red-600 hover:text-red-800 disabled:opacity-50"
                              disabled={!!processingAction}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
              <button
                onClick={handlePreviousStep}
                disabled={!!processingAction}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 order-2 sm:order-1"
              >
                <ChevronLeft className="inline-block mr-2" /> Précédent
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || groups.length === 0 || !!processingAction}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 order-1 sm:order-2"
              >
                {processingAction ? (
                  <>
                    <Loader className="inline-block animate-spin mr-2 h-4 w-4" />
                    Sauvegarde...
                  </>
                ) : id ? (
                  "Mettre à jour la session"
                ) : (
                  "Créer une session"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GameSetup

