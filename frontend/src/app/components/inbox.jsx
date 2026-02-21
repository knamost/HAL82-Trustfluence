/**
 * Inbox — full messaging view with conversation list and thread detail.
 * Supports sending messages, auto-scrolling, and periodic polling.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  MessageSquare, Send, Loader2, ArrowLeft, User,
  AlertCircle, Clock, ChevronRight
} from "lucide-react";
import { listConversations, getConversation, sendMessage } from "../../api/message.api";
import { useAuth } from "../context/auth-context";

const POLL_INTERVAL = 8000; // 8 seconds

export function Inbox() {
  const { user } = useAuth();
  const { userId: selectedUserId } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load conversations list
  const loadConversations = useCallback(async () => {
    try {
      const data = await listConversations();
      setConversations(data);
    } catch {
      // silent fail on poll
    }
  }, []);

  // Load specific conversation thread
  const loadThread = useCallback(async (otherId) => {
    setMsgLoading(true);
    try {
      const data = await getConversation(otherId);
      setMessages(data);
    } catch (err) {
      setError(err?.message || "Failed to load messages");
    } finally {
      setMsgLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    setLoading(true);
    loadConversations().finally(() => setLoading(false));
  }, [loadConversations]);

  // Load thread when selectedUserId changes
  useEffect(() => {
    if (selectedUserId) {
      loadThread(selectedUserId);
    }
  }, [selectedUserId, loadThread]);

  // Polling for new messages
  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations();
      if (selectedUserId) {
        loadThread(selectedUserId);
      }
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [selectedUserId, loadConversations, loadThread]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when thread opens
  useEffect(() => {
    if (selectedUserId) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [selectedUserId]);

  async function handleSend(e) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId || sending) return;
    setSending(true);
    try {
      const msg = await sendMessage({
        receiverId: selectedUserId,
        content: newMessage.trim(),
      });
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
      // Update conversations list
      loadConversations();
    } catch (err) {
      setError(err?.message || "Failed to send message");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSending(false);
    }
  }

  function getParticipantName(p) {
    if (!p) return "Unknown";
    const name = [p.firstName, p.lastName].filter(Boolean).join(" ");
    return name || p.email || "User";
  }

  function getInitial(p) {
    if (!p) return "?";
    return (p.firstName || p.email || "?").charAt(0).toUpperCase();
  }

  function formatTime(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  // Selected conversation participant
  const selectedParticipant = conversations.find(
    (c) => c.participantId === selectedUserId
  )?.participant;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Conversations Sidebar */}
      <div className={`${selectedUserId ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 lg:w-96 border-r border-border`}>
        <div className="p-4 border-b border-border">
          <h2 className="text-[#0A1628] flex items-center gap-2" style={{ fontWeight: 600, fontSize: '1.125rem' }}>
            <MessageSquare className="w-5 h-5 text-[#2563EB]" />
            Messages
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <MessageSquare className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-[#0A1628]" style={{ fontWeight: 600 }}>No conversations yet</p>
              <p className="text-muted-foreground mt-1" style={{ fontSize: "0.875rem" }}>
                Start a conversation from a creator or brand profile.
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.participantId === selectedUserId;
              return (
                <button
                  key={conv.participantId}
                  onClick={() => navigate(`/messages/${conv.participantId}`)}
                  className={`w-full flex items-center gap-3 p-4 text-left hover:bg-[#F8FAFC] transition-colors border-b border-border/50 ${
                    isActive ? "bg-[#EEF2FF]" : ""
                  }`}
                >
                  <div className="w-10 h-10 bg-[#EEF2FF] rounded-full flex items-center justify-center shrink-0">
                    <span className="text-[#2563EB]" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {getInitial(conv.participant)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#0A1628] truncate" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {getParticipantName(conv.participant)}
                      </span>
                      <span className="text-muted-foreground shrink-0 ml-2" style={{ fontSize: '0.75rem' }}>
                        {formatTime(conv.lastMessage?.createdAt)}
                      </span>
                    </div>
                    <p className="text-muted-foreground truncate" style={{ fontSize: '0.8125rem' }}>
                      {conv.lastMessage?.senderId === user?.id ? "You: " : ""}
                      {conv.lastMessage?.content || "..."}
                    </p>
                    {conv.participant?.role && (
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        conv.participant.role === "brand"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-blue-50 text-blue-600"
                      }`}>
                        {conv.participant.role}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Message Thread */}
      <div className={`${selectedUserId ? "flex" : "hidden md:flex"} flex-col flex-1`}>
        {selectedUserId ? (
          <>
            {/* Thread Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-white">
              <button
                onClick={() => navigate("/messages")}
                className="md:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-[#EEF2FF] rounded-full flex items-center justify-center">
                <span className="text-[#2563EB]" style={{ fontWeight: 600 }}>
                  {getInitial(selectedParticipant)}
                </span>
              </div>
              <div>
                <p className="text-[#0A1628]" style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                  {getParticipantName(selectedParticipant)}
                </p>
                {selectedParticipant?.role && (
                  <span className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                    {selectedParticipant.role}
                  </span>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFBFD]">
              {msgLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <MessageSquare className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                    No messages yet. Start the conversation!
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                          isMine
                            ? "bg-[#2563EB] text-white rounded-br-md"
                            : "bg-white text-[#0A1628] border border-border rounded-bl-md"
                        }`}
                      >
                        <p style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{msg.content}</p>
                        <p
                          className={`mt-1 ${isMine ? "text-white/60" : "text-muted-foreground"}`}
                          style={{ fontSize: '0.6875rem' }}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-2 bg-red-50 text-red-600 border-t border-red-200 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            {/* Send input */}
            <form onSubmit={handleSend} className="flex items-center gap-2 p-4 border-t border-border bg-white">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                style={{ fontSize: '0.875rem' }}
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="p-2.5 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground mb-3" />
            <h3 className="text-[#0A1628]" style={{ fontWeight: 600 }}>Select a conversation</h3>
            <p className="text-muted-foreground mt-1" style={{ fontSize: '0.875rem' }}>
              Choose a conversation from the sidebar to view messages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
