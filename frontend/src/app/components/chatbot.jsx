import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, MessageCircle, X } from "lucide-react";

function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi 👋 I'm Trustfluence AI. Ask me anything about creators or campaigns.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { sender: "user", text: input, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8001/chat", {
        message: input,
      });

      const botMsg = {
        sender: "bot",
        text: res.data.response || "I have no response for that.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Oops! I couldn’t reach the AI server. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-[#2563EB] text-white p-4 rounded-full shadow-lg hover:bg-[#1D4ED8] transition-all z-50"
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-300 flex flex-col overflow-hidden z-50">
          {/* Header */}
          <div className="bg-[#2563EB] text-blue-400 p-4 font-medium">Trustfluence AI</div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50 max-h-96">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-xl text-sm max-w-[80%] transition-all ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white- ml-auto hover:opacity-90"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <div>{msg.text}</div>
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
            {loading && (
              <div className="bg-gray-200 text-gray-600 p-2 rounded-xl text-sm w-fit">
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex border-t">
            <input
              type="text"
              className="flex-1 p-3 text-sm outline-none text-gray-900"
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              className={`px-4 flex items-center justify-center ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#2563EB] text-white"
              }`}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default FloatingChatbot;