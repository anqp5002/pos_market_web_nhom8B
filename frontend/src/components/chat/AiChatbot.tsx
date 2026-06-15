"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { apiFetch, getClientToken } from "@/lib/api";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: "Xin chào! Tôi là Trợ lý ảo POS Market. Tôi có thể giúp gì cho bạn hôm nay?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const token = await getClientToken();
      const res = await apiFetch<{ reply: string }>("/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (res && res.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: res.reply,
          },
        ]);
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 print:hidden">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg shadow-blue-200 transition-transform hover:scale-105 flex items-center justify-center group"
          aria-label="Mở trợ lý ảo"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute right-full mr-4 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Trợ lý AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 overflow-hidden flex flex-col h-[500px] border border-gray-100 flex flex-col transition-all origin-bottom-right">
          {/* Header */}
          <div className="bg-blue-600 p-4 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">POS Market Bot</h3>
                <p className="text-xs text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                  Trợ lý thông minh
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-blue-100 hover:text-white transition-colors p-1"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                    msg.role === "user"
                      ? "bg-gray-200 text-gray-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-sm whitespace-pre-wrap"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2.5">
                <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mt-1">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 shrink-0">
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-2 py-1 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400/20 transition-all"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 py-2 text-gray-700 placeholder:text-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white disabled:opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mr-0.5"
                aria-label="Gửi"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 ml-0.5" />
                )}
              </button>
            </form>
            <div className="text-center mt-2">
              <span className="text-[10px] text-gray-400">
                AI có thể đưa ra thông tin không chính xác
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
