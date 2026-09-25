import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
    getConversations, getMessagesAvecUser, envoyerMessage, marquerConversationLue
} from "../../services/messageService";
import { getOffreById } from "../../services/offreService";
import {
    FaLeaf, FaPaperPlane, FaUserCircle, FaComments, FaArrowLeft,
    FaBox, FaSearch, FaCheckDouble, FaCircle, FaThLarge,
    FaShoppingCart, FaRegCommentDots, FaChartBar, FaCog,
    FaSignOutAlt, FaBell, FaStore, FaShoppingBag
} from "react-icons/fa";

export default function Messagerie() {
    const { user, logoutUser } = useAuth();
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
            setConversations(data || []);
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
            const existing = conversations.find(c => c.utilisateur.id === userIdNum);
            if (existing) {
                setSelectedUser(existing.utilisateur);
            } else {
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
                setMessages(msgs || []);
                await marquerConversationLue(selectedUser.id);
                fetchConvs();
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
            setNouveauMessage(text);
        } finally {
            setSending(false);
        }
    };

    const handleLogout = async () => {
        await logoutUser();
        navigate("/");
    };

    const dashboardLink = user?.role === "admin" ? "/admin" : user?.role === "acheteur" ? "/acheteur" : "/vendeur";
    const currentAvatar = user?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nom || "U")}&background=138040&color=fff`;

    return (
        <div className="flex h-screen bg-[#f8f9fc] font-sans text-gray-800 overflow-hidden">

            {/* ===== SIDEBAR ===== */}
            <aside className="w-[240px] bg-white border-r border-gray-100 flex-col justify-between hidden md:flex shrink-0">
                <div>
                    {/* Logo SenAgri */}
                    <div className="px-6 pt-6 pb-8">
                        <Link to="/" className="flex items-center gap-3">
                            <FaLeaf className="text-[#138040] text-[26px]" />
                            <div>
                                <p className="text-[18px] font-extrabold text-[#138040] leading-none tracking-tight">SenAgri</p>
                                <p className="text-[9px] text-gray-400 font-bold mt-0.5 uppercase tracking-widest">Marché Agricole B2B</p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation conditionnelle selon le rôle */}
                    {user?.role === "acheteur" ? (
                        <div className="px-4">
                            <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-[0.15em] mb-3 px-2">Espace Acheteur</p>
                            <nav className="space-y-1">
                                <Link
                                    to="/acheteur"
                                    className="w-full flex items-center gap-3 text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left"
                                >
                                    <FaStore className="text-gray-400 text-[14px] shrink-0" /> Offres & Catalogue
                                </Link>

                                <Link
                                    to="/acheteur"
                                    className="w-full flex items-center justify-between text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left"
                                >
                                    <span className="flex items-center gap-3">
                                        <FaShoppingBag className="text-gray-400 text-[14px] shrink-0" /> Mes Commandes
                                    </span>
                                </Link>

                                {/* Messagerie Active */}
                                <button
                                    className="w-full flex items-center justify-between bg-[#138040] text-white px-4 py-2.5 rounded-[12px] font-bold text-[12px] shadow-sm transition-colors text-left"
                                >
                                    <span className="flex items-center gap-3">
                                        <FaRegCommentDots className="text-white/80 text-[14px] shrink-0" /> Messagerie
                                    </span>
                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                </button>
                            </nav>
                        </div>
                    ) : (
                        <div className="px-4">
                            <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-[0.15em] mb-3 px-2">Tableau de bord</p>
                            <nav className="space-y-1">
                                <Link
                                    to="/vendeur"
                                    className="w-full flex items-center gap-3 text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left"
                                >
                                    <FaThLarge className="text-gray-400 text-[14px] shrink-0" /> Vue d'ensemble
                                </Link>

                                <Link
                                    to="/vendeur"
                                    className="w-full flex items-center gap-3 text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left"
                                >
                                    <FaBox className="text-gray-400 text-[14px] shrink-0" /> Mes offres
                                </Link>

                                <Link
                                    to="/vendeur"
                                    className="w-full flex items-center justify-between text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left"
                                >
                                    <span className="flex items-center gap-3">
                                        <FaShoppingCart className="text-gray-400 text-[14px] shrink-0" /> Commandes
                                    </span>
                                </Link>

                                {/* Messagerie Active */}
                                <button
                                    className="w-full flex items-center justify-between bg-[#138040] text-white px-4 py-2.5 rounded-[12px] font-bold text-[12px] shadow-sm transition-colors text-left"
                                >
                                    <span className="flex items-center gap-3">
                                        <FaRegCommentDots className="text-white/80 text-[14px] shrink-0" /> Messagerie
                                    </span>
                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                </button>

                                <Link
                                    to="/vendeur"
                                    className="w-full flex items-center gap-3 text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left"
                                >
                                    <FaChartBar className="text-gray-400 text-[14px] shrink-0" /> Statistiques
                                </Link>
                            </nav>
                        </div>
                    )}
                </div>

                {/* Bottom Nav */}
                <div className="px-4 pb-6 border-t border-gray-100 pt-4 space-y-1">
                    <Link
                        to="/profil"
                        className="w-full flex items-center gap-3 text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left"
                    >
                        <FaCog className="text-gray-400 text-[14px] shrink-0" /> Paramètres
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 text-[#c0392b] hover:bg-red-50 px-4 py-2.5 rounded-[12px] font-bold text-[12px] transition-colors text-left"
                    >
                        <FaSignOutAlt className="text-[#c0392b] text-[14px] shrink-0" /> Déconnexion
                    </button>
                </div>
            </aside>

            {/* ===== MAIN CONTENT ===== */}
            <main className="flex-1 overflow-y-auto flex flex-col">
                {/* Sticky Header */}
                <header className="bg-white/80 backdrop-blur sticky top-0 z-10 px-8 py-3 flex items-center justify-between border-b border-gray-100 shrink-0">
                    <span className="bg-[#e4f5ed] text-[#138040] text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#138040] rounded-full inline-block"></span>
                        Sénégal • Campagne en cours
                    </span>
                    <div className="flex items-center gap-5">
                        <button className="relative text-gray-500 hover:text-gray-800">
                            <FaBell className="text-xl" />
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#f08c35] border-2 border-white rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-[13px] font-bold text-gray-900 leading-none">{user?.nom || "Utilisateur"}</p>
                                <p className="text-[10px] font-bold text-[#b05a18] mt-0.5 capitalize">
                                    {user?.role === "vendeur" ? "Vendeur Certifié" : user?.role || "Membre"}
                                </p>
                            </div>
                            <img
                                src={currentAvatar}
                                alt="avatar"
                                className="w-9 h-9 rounded-full object-cover border-2 border-[#e4f5ed]"
                            />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8 max-w-[1100px] w-full mx-auto flex-grow flex flex-col">

                    {/* Sub-header navigation */}
                    <div className="flex items-center justify-between mb-4 shrink-0">
                        <Link
                            to={dashboardLink}
                            className="flex items-center gap-2 text-[13px] font-bold text-gray-600 hover:text-[#138040] transition-colors"
                        >
                            <FaArrowLeft className="text-[11px]" /> Retour au tableau de bord
                        </Link>
                        <span className="text-[12px] font-bold text-gray-400">
                            Négociation Directe • <span className="text-[#138040]">Messagerie Sécurisée</span>
                        </span>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-[#eef3fb] border border-[#d6e4f7] rounded-[16px] px-6 py-3.5 mb-6 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-extrabold text-[#5b7fb5] uppercase tracking-widest mb-0.5">Plateforme Nationale SenAgri</p>
                            <p className="text-[15px] font-extrabold text-[#1a2e50]">Échangez en direct et négociez en toute transparence</p>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#e4f5ed] text-[#138040] border border-[#b8e2cd]">
                                <FaStore className="text-[9px]" /> Vendeur (Vert)
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
                                <FaShoppingBag className="text-[9px]" /> Acheteur (Bleu)
                            </span>
                        </div>
                    </div>

                    {/* Chat Card (2 Colonnes) */}
                    <div className="bg-white rounded-[20px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden flex-grow grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
                        
                        {/* COLONNE GAUCHE : LISTE DES CONVERSATIONS (4 cols) */}
                        <div className={`md:col-span-4 border-r border-gray-100 flex flex-col bg-[#fbfcfd] ${selectedUser ? "hidden md:flex" : "flex"}`}>
                            <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between">
                                <div>
                                    <h2 className="font-extrabold text-gray-900 text-[14px]">Conversations</h2>
                                    <p className="text-[11px] text-gray-400 font-medium">Vos échanges récents</p>
                                </div>
                                <span className="bg-[#e4f5ed] text-[#138040] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                    {conversations.length}
                                </span>
                            </div>

                            <div className="overflow-y-auto flex-grow divide-y divide-gray-50">
                                {loadingConvs ? (
                                    <div className="p-8 text-center text-xs text-gray-400">
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#138040] border-t-transparent mx-auto mb-2"></div>
                                        Chargement...
                                    </div>
                                ) : conversations.length === 0 && !selectedUser ? (
                                    <div className="p-8 text-center text-xs text-gray-400">
                                        <p className="text-2xl mb-2">💬</p>
                                        Aucune discussion en cours.
                                    </div>
                                ) : (
                                    conversations.map((conv) => {
                                        const isSelected = selectedUser?.id === conv.utilisateur.id;
                                        const partnerRole = conv.utilisateur.role || (user?.role === "acheteur" ? "vendeur" : "acheteur");
                                        const isPartnerSeller = partnerRole === "vendeur";

                                        return (
                                            <div
                                                key={conv.utilisateur.id}
                                                onClick={() => setSelectedUser(conv.utilisateur)}
                                                className={`p-4 cursor-pointer transition-all flex items-center gap-3 hover:bg-[#f0faf5] ${
                                                    isSelected ? "bg-[#f0faf5] border-l-4 border-[#138040]" : ""
                                                }`}
                                            >
                                                <div className={`w-10 h-10 rounded-full font-black flex items-center justify-center text-[12px] shrink-0 uppercase shadow-xs ${
                                                    isPartnerSeller ? "bg-[#e4f5ed] text-[#138040] border border-[#b8e2cd]" : "bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]"
                                                }`}>
                                                    {(conv.utilisateur.nom || "U").substring(0, 2)}
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex justify-between items-baseline gap-1">
                                                        <div className="flex items-center gap-1.5 truncate">
                                                            <h4 className="font-bold text-[12px] text-gray-900 truncate">
                                                                {conv.utilisateur.nom}
                                                            </h4>
                                                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                                                                isPartnerSeller ? "bg-[#e4f5ed] text-[#138040]" : "bg-[#eff6ff] text-[#1d4ed8]"
                                                            }`}>
                                                                {isPartnerSeller ? "Vendeur" : "Acheteur"}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 font-medium shrink-0">
                                                            {conv.date_envoi ? new Date(conv.date_envoi).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }) : ""}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 truncate mt-0.5 font-medium">
                                                        {conv.dernier_message}
                                                    </p>
                                                </div>
                                                {conv.non_lus > 0 && (
                                                    <span className="bg-[#f08c35] text-white text-[9px] font-black px-2 py-0.5 rounded-full shrink-0">
                                                        {conv.non_lus}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* COLONNE DROITE : FIL DE DISCUSSION (8 cols) */}
                        <div className={`md:col-span-8 flex flex-col bg-white ${!selectedUser ? "hidden md:flex" : "flex"}`}>
                            {selectedUser ? (
                                <>
                                    {/* En-tête du Chat */}
                                    {(() => {
                                        const interlocuteurRole = selectedUser?.role || (user?.role === "acheteur" ? "vendeur" : "acheteur");
                                        const isInterlocuteurSeller = interlocuteurRole === "vendeur";

                                        return (
                                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-[#fbfcfd]">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => setSelectedUser(null)}
                                                        className="md:hidden text-gray-500 p-2 hover:bg-gray-100 rounded-xl"
                                                    >
                                                        <FaArrowLeft />
                                                    </button>
                                                    <div className={`w-10 h-10 rounded-full font-black flex items-center justify-center text-[12px] uppercase shrink-0 shadow-sm text-white ${
                                                        isInterlocuteurSeller ? "bg-[#138040]" : "bg-[#1d4ed8]"
                                                    }`}>
                                                        {(selectedUser.nom || "U").substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-extrabold text-[14px] text-gray-900 leading-tight">{selectedUser.nom}</h3>
                                                            {isInterlocuteurSeller ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#e4f5ed] text-[#138040] border border-[#a3d9bc]">
                                                                    <FaStore className="text-[8px]" /> Vendeur
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
                                                                    <FaShoppingBag className="text-[8px]" /> Acheteur
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-[#138040] font-bold flex items-center gap-1 mt-0.5">
                                                            <FaCircle className="text-[6px]" /> En ligne
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Offre liée */}
                                                {offreContext && (
                                                    <div className="hidden sm:flex items-center gap-2 bg-[#f0faf5] px-3 py-1.5 rounded-xl border border-[#d5eddf] text-[11px]">
                                                        <FaBox className="text-[#138040]" />
                                                        <span className="font-bold text-gray-800 line-clamp-1">{offreContext.nom}</span>
                                                        <span className="font-black text-[#138040]">{Number(offreContext.prix_unitaire).toLocaleString("fr-FR")} FCFA</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* Zone des Messages avec Différenciation Acheteur / Vendeur */}
                                    <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-[#f8f9fc]">
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
                                                const senderRole = isMe
                                                    ? (user?.role || "acheteur")
                                                    : (msg.expediteur?.role || selectedUser?.role || (user?.role === "acheteur" ? "vendeur" : "acheteur"));
                                                const isSeller = senderRole === "vendeur";
                                                const senderDisplayName = isMe
                                                    ? "Vous"
                                                    : (msg.expediteur?.nom || selectedUser?.nom || (isSeller ? "Vendeur" : "Acheteur"));

                                                return (
                                                    <div
                                                        key={msg.id}
                                                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                                                    >
                                                        {/* En-tête : Badge Rôle & Nom de l'expéditeur */}
                                                        <div className={`flex items-center gap-1.5 mb-1 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                                            {isSeller ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#e4f5ed] text-[#138040] border border-[#a3d9bc] shadow-xs">
                                                                    <FaStore className="text-[8px]" /> Vendeur
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] shadow-xs">
                                                                    <FaShoppingBag className="text-[8px]" /> Acheteur
                                                                </span>
                                                            )}
                                                            <span className="text-[11px] font-bold text-gray-700">
                                                                {senderDisplayName}
                                                            </span>
                                                        </div>

                                                        {/* Bulle de Message avec couleurs selon le rôle */}
                                                        <div
                                                            className={`max-w-[78%] p-3.5 rounded-[18px] text-[12px] leading-relaxed shadow-sm transition-all ${
                                                                isMe
                                                                    ? (isSeller
                                                                        ? "bg-[#138040] text-white rounded-tr-xs border border-[#0f6834]"
                                                                        : "bg-[#1d4ed8] text-white rounded-tr-xs border border-[#1e40af]"
                                                                      )
                                                                    : (isSeller
                                                                        ? "bg-[#f0faf5] text-gray-900 rounded-tl-xs border-2 border-[#b8e2cd]"
                                                                        : "bg-[#f8faff] text-gray-900 rounded-tl-xs border-2 border-[#bfdbfe]"
                                                                      )
                                                            }`}
                                                        >
                                                            {/* Offre liée attachée au message */}
                                                            {msg.offre && (
                                                                <div className={`mb-2 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 ${
                                                                    isMe ? "bg-white/20 text-white" : (isSeller ? "bg-[#e4f5ed] text-[#138040]" : "bg-[#eff6ff] text-[#1d4ed8]")
                                                                }`}>
                                                                    <FaBox className="text-[9px]" />
                                                                    <span>Offre liée : {msg.offre.nom}</span>
                                                                </div>
                                                            )}
                                                            <p className="whitespace-pre-wrap">{msg.contenu}</p>
                                                        </div>

                                                        {/* Heure et accusé de lecture */}
                                                        <div className={`flex items-center gap-1.5 mt-1 px-1 text-[9px] text-gray-400 font-medium ${isMe ? "justify-end" : "justify-start"}`}>
                                                            <span>
                                                                {new Date(msg.date_envoi || msg.created_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            {isMe && (
                                                                <FaCheckDouble className={`text-[9px] ${msg.lu ? "text-[#138040]" : "text-gray-300"}`} />
                                                            )}
                                                        </div>
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
                                            className="flex-grow py-3 px-4 rounded-[12px] border border-gray-200 text-[12px] outline-none focus:border-[#138040] transition-colors"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!nouveauMessage.trim() || sending}
                                            className="py-3 px-5 bg-[#138040] hover:bg-[#0e6530] text-white font-extrabold rounded-[12px] text-[12px] transition shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FaPaperPlane className="text-[11px]" />
                                            <span className="hidden sm:inline">Envoyer</span>
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-gray-400">
                                    <FaComments className="text-5xl text-gray-200 mb-3" />
                                    <h3 className="text-base font-bold text-gray-700">Aucune conversation sélectionnée</h3>
                                    <p className="text-xs text-gray-400 mt-1 max-w-xs">
                                        Sélectionnez une discussion à gauche pour afficher les messages échangés.
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
