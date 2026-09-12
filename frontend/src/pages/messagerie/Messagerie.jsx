import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/home/Navbar";
import { useAuth } from "../../hooks/useAuth";
import {
    getConversations, getMessagesAvecUser, envoyerMessage, marquerConversationLue
} from "../../services/messageService";
import { getOffreById } from "../../services/offreService";
import {
    FaPaperPlane, FaUserCircle, FaComments, FaArrowLeft,
    FaBox, FaSearch, FaCheckDouble, FaCircle
} from "react-icons/fa";

export default function Messagerie() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const targetUserIdParam = searchParams.get("user");
    const targetOffreIdParam = searchParams.get("offre");

    const [conversations, setConversations] = useState([]);
    const [loadingConvs, setLoadingConvs] = useState(true);

    const [selectedUser, setSelectedUser] = useState(null); // { id, nom, email }
    const [messages, setMessages] = useState([]);
    const [loadingMsgs, setLoadingMsgs] = useState(false);

    const [nouveauMessage, setNouveauMessage] = useState("");
    const [sending, setSending] = useState(false);

    const [offreContext, setOffreContext] = useState(null);
    const messagesEndRef = useRef(null);

    // Auto scroll vers le bas du chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 1. Charger les conversations
    const fetchConvs = async () => {
        try {
            const data = await getConversations();
            setConversations(data);
            return data;
        } catch (err) {
            console.error("Erreur chargement conversations :", err);
            return [];
        } finally {
            setLoadingConvs(false);
        }
    };

    useEffect(() => {
        fetchConvs();
    }, []);

    // 2. Gestion de l'ouverture de conversation selon URL params
    useEffect(() => {
        if (targetUserIdParam) {
            const userIdNum = Number(targetUserIdParam);
            // Vérifier si l'interlocuteur est déjà dans la liste
            const existing = conversations.find(c => c.utilisateur.id === userIdNum);
            if (existing) {
                setSelectedUser(existing.utilisateur);
            } else {
                // Créer un profil temporaire pour entamer la conversation
                setSelectedUser({
                    id: userIdNum,
                    nom: searchParams.get("vendeurNom") || `Utilisateur #${userIdNum}`,
                    email: ""
                });
            }
        }

        if (targetOffreIdParam) {
            getOffreById(targetOffreIdParam)
                .then(setOffreContext)
                .catch(console.error);
        }
    }, [targetUserIdParam, targetOffreIdParam, conversations]);

    // 3. Charger les messages quand un utilisateur est sélectionné
    useEffect(() => {
        if (!selectedUser) return;

        const loadMessages = async () => {
            try {
                setLoadingMsgs(true);
                const msgs = await getMessagesAvecUser(selectedUser.id);
                setMessages(msgs);
                await marquerConversationLue(selectedUser.id);
                fetchConvs(); // Rafraîchir les compteurs non lus
            } catch (err) {
                console.error("Erreur chargement messages :", err);
            } finally {
                setLoadingMsgs(false);
                setTimeout(scrollToBottom, 100);
            }
        };

        loadMessages();
    }, [selectedUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 4. Envoi de message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!nouveauMessage.trim() || !selectedUser || sending) return;

        setSending(true);
        const text = nouveauMessage.trim();
        setNouveauMessage("");

        try {
            const res = await envoyerMessage({
                destinataire_id: selectedUser.id,
                offre_id: offreContext?.id || (targetOffreIdParam ? Number(targetOffreIdParam) : null),
                contenu: text,
            });

            const newMsgObj = res.data || {
                id: Date.now(),
                expediteur_id: user?.id,
                destinataire_id: selectedUser.id,
                contenu: text,
                date_envoi: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, newMsgObj]);
            fetchConvs();
        } catch (err) {
            console.error("Erreur envoi message :", err);
            setNouveauMessage(text); // Restaurer la saisie en cas d'erreur
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow w-full flex flex-col">
                
                {/* En-tête Messagerie */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
                            <FaComments className="text-green-600" />
                            Messagerie B2B SenAgri
                        </h1>
                        <p className="text-xs text-gray-500 mt-1">
                            Discutez directement avec les producteurs et acheteurs de produits agricoles.
                        </p>
                    </div>
                </div>

                {/* Interface de Chat (Grille 2 Colonnes) */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex-grow grid grid-cols-1 md:grid-cols-12 min-h-[550px] max-h-[700px]">
                    
                    {/* COLONNE GAUCHE : LISTE DES CONVERSATIONS (4 cols) */}
                    <div className={`md:col-span-4 border-r border-gray-100 flex flex-col bg-gray-50/50 ${selectedUser ? "hidden md:flex" : "flex"}`}>
                        <div className="p-4 border-b border-gray-100 bg-white">
                            <h2 className="font-bold text-gray-900 text-sm">Conversations</h2>
                            <p className="text-[11px] text-gray-400">Vos discussions récentes</p>
                        </div>

                        <div className="overflow-y-auto flex-grow divide-y divide-gray-100">
                            {loadingConvs ? (
                                <div className="p-8 text-center text-xs text-gray-400">
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-600 border-t-transparent mx-auto mb-2"></div>
                                    Chargement...
                                </div>
                            ) : conversations.length === 0 && !selectedUser ? (
                                <div className="p-8 text-center text-xs text-gray-400">
                                    <p className="text-2xl mb-2">💬</p>
                                    Aucune conversation en cours.
                                </div>
                            ) : (
                                conversations.map((conv) => {
                                    const isSelected = selectedUser?.id === conv.utilisateur.id;
                                    return (
                                        <div
                                            key={conv.utilisateur.id}
                                            onClick={() => setSelectedUser(conv.utilisateur)}
                                            className={`p-4 cursor-pointer transition-all flex items-center gap-3 hover:bg-green-50/50 ${
                                                isSelected ? "bg-green-50 border-l-4 border-green-600" : ""
                                            }`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-800 font-bold flex items-center justify-center text-sm flex-shrink-0">
                                                {conv.utilisateur.nom ? conv.utilisateur.nom.charAt(0).toUpperCase() : "U"}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <div className="flex justify-between items-baseline">
                                                    <h4 className="font-bold text-xs text-gray-900 truncate">
                                                        {conv.utilisateur.nom}
                                                    </h4>
                                                    <span className="text-[10px] text-gray-400">
                                                        {conv.date_envoi ? new Date(conv.date_envoi).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }) : ""}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                                    {conv.dernier_message}
                                                </p>
                                            </div>
                                            {conv.non_lus > 0 && (
                                                <span className="bg-green-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                                    {conv.non_lus}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* COLONNE DROITE : FENÊTRE DE DISCUSSION (8 cols) */}
                    <div className={`md:col-span-8 flex flex-col bg-white ${!selectedUser ? "hidden md:flex" : "flex"}`}>
                        {selectedUser ? (
                            <>
                                {/* En-tête du Chat */}
                                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setSelectedUser(null)}
                                            className="md:hidden text-gray-500 p-2 hover:bg-gray-100 rounded-xl"
                                        >
                                            <FaArrowLeft />
                                        </button>
                                        <div className="w-10 h-10 rounded-full bg-green-700 text-white font-bold flex items-center justify-center text-sm">
                                            {selectedUser.nom ? selectedUser.nom.charAt(0).toUpperCase() : "U"}
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-sm text-gray-900">{selectedUser.nom}</h3>
                                            <span className="text-[11px] text-green-600 font-semibold flex items-center gap-1">
                                                <FaCircle className="text-[8px]" /> En ligne
                                            </span>
                                        </div>
                                    </div>

                                    {/* Offre liée le cas échéant */}
                                    {offreContext && (
                                        <div className="hidden sm:flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-xl border border-green-200 text-xs">
                                            <FaBox className="text-green-700" />
                                            <span className="font-bold text-gray-800 line-clamp-1">{offreContext.nom}</span>
                                            <span className="font-black text-green-700">{Number(offreContext.prix_unitaire).toLocaleString("fr-FR")} FCFA</span>
                                        </div>
                                    )}
                                </div>

                                {/* Zone des Messages */}
                                <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50/50">
                                    {loadingMsgs ? (
                                        <div className="text-center py-10 text-xs text-gray-400">
                                            Chargement des messages...
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center py-12 text-xs text-gray-400">
                                            <p className="text-3xl mb-2">🤝</p>
                                            Démarrez la discussion avec <strong>{selectedUser.nom}</strong>.
                                        </div>
                                    ) : (
                                        messages.map((msg) => {
                                            const isMe = msg.expediteur_id === user?.id || msg.expediteur?.id === user?.id;
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                                                >
                                                    <div
                                                        className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                                                            isMe
                                                                ? "bg-green-700 text-white rounded-br-none"
                                                                : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                                                        }`}
                                                    >
                                                        {msg.contenu}
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                                                        {new Date(msg.date_envoi || msg.created_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Zone de Saisie */}
                                <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 bg-white flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={nouveauMessage}
                                        onChange={(e) => setNouveauMessage(e.target.value)}
                                        placeholder={`Écrire un message à ${selectedUser.nom}...`}
                                        className="flex-grow py-3 px-4 rounded-xl border border-gray-200 text-xs outline-none focus:border-green-600 transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!nouveauMessage.trim() || sending}
                                        className="py-3 px-5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FaPaperPlane />
                                        <span className="hidden sm:inline">Envoyer</span>
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-gray-400">
                                <FaComments className="text-5xl text-gray-200 mb-3" />
                                <h3 className="text-base font-bold text-gray-700">Aucune conversation sélectionnée</h3>
                                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                                    Choisissez une conversation dans la liste de gauche ou contactez un vendeur depuis une offre.
                                </p>
                            </div>
                        )}
                    </div>

                </div>

            </main>
        </div>
    );
}
