"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

type Message = {
  role: "user" | "bot";
  content: string;
};

export const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hi there! I am your SmartLease Assistant. How can I help you today?" }
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

  const toggleWidget = () => setIsOpen(!isOpen);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error("API response error");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "bot", content: data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 font-sans text-base">
      {isOpen && (
        <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl flex flex-col w-80 sm:w-96 h-[32rem] mb-4 transform transition-all duration-300 origin-bottom-left">
          {/* Header */}
          <div className="bg-black text-white p-4 rounded-t-2xl flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
              <h3 className="font-bold text-lg">SmartLease AI</h3>
            </div>
            <button
              onClick={toggleWidget}
              className="text-white hover:text-blue-200 transition-colors"
              aria-label="Close Chat"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-black text-white rounded-br-none ml-auto"
                      : "bg-white border shadow-sm text-slate-900 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm font-medium">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border shadow-sm text-slate-900 rounded-2xl rounded-bl-none px-4 py-3 max-w-[85%] flex items-center gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t rounded-b-2xl">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about properties, rent, tokens..."
                className="flex-1 bg-slate-100 border-transparent text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary rounded-full px-4 py-2 text-sm outline-none transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-black text-white p-2 rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PaperAirplaneIcon className="h-5 w-5 -rotate-45 ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button & Tooltip */}
      <div className="flex items-center gap-3">
        {/* Intro Tooltip - Only shows when closed */}
        {!isOpen && (
          <div className="bg-white px-4 py-2 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center animate-bounce">
            <p className="text-sm font-semibold text-slate-800 whitespace-nowrap">Hi! I am your assistant 👋</p>
            {/* Tooltip Arrow */}
            <div className="absolute right-14 top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-r border-t border-gray-100 rotate-45 transform origin-top-right"></div>
          </div>
        )}
        
        <button
          onClick={toggleWidget}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500/50 ${
            isOpen ? '!bg-black text-white shadow-inner' : '!bg-black text-white hover:bg-gray-900'
          }`}
          aria-label="Toggle Chatbot"
          aria-expanded={isOpen}
        >
          <ChatBubbleLeftRightIcon className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

