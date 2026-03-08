"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Message } from "@/types";
import { getMessages, saveMessages, incrementMessageCount } from "@/lib/storage";

interface ChatInterfaceProps {
  onMessageSent: () => void;
}

const WELCOME_MSG =
  "I'm here to help you when something doesn't make sense. What are you stuck on?";

function RubyAvatar({ size = "w-8 h-8" }: { size?: string }) {
  return (
    <div className={`${size} rounded-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800`}>
      <img
        src="/ruby-avatar.png"
        alt="Ruby"
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback to initials if image not found
          const el = e.currentTarget;
          el.style.display = "none";
          el.parentElement!.innerHTML =
            `<span class="w-full h-full flex items-center justify-center text-white text-sm font-bold">R</span>`;
        }}
      />
    </div>
  );
}

export default function ChatInterface({ onMessageSent }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = getMessages();
    if (saved.length > 0) {
      setMessages(saved);
    } else {
      const welcome: Message = {
        id: "welcome",
        role: "assistant",
        content: WELCOME_MSG,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcome]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      const messageText = attachedFile
        ? `${text.trim()}${text.trim() ? "\n" : ""}[Attached: ${attachedFile.name}]`
        : text.trim();

      if (!messageText || isLoading) return;

      const userMessage: Message = {
        id: `user_${Date.now()}`,
        role: "user",
        content: messageText,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");
      setAttachedFile(null);
      setIsLoading(true);
      incrementMessageCount();
      onMessageSent();

      const assistantMessage: Message = {
        id: `asst_${Date.now()}`,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedMessages }),
        });

        if (!response.ok) throw new Error("Failed to fetch");

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id ? { ...m, content: fullText } : m
            )
          );
        }

        const finalMessages = updatedMessages.concat({
          ...assistantMessage,
          content: fullText,
        });
        saveMessages(finalMessages);
        incrementMessageCount();
        onMessageSent();

        if (fullText && "speechSynthesis" in window) {
          const plainText = fullText.replace(/[#*`_\[\]()]/g, "").replace(/\n+/g, " ");
          const utterance = new SpeechSynthesisUtterance(plainText.slice(0, 500));
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.onstart = () => setIsSpeaking(true);
          utterance.onend = () => setIsSpeaking(false);
          window.speechSynthesis.speak(utterance);
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, content: "Sorry, something went wrong. Please try again." }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, onMessageSent, attachedFile]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachedFile(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  const startVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input is not supported in your browser. Try Chrome.");
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => r[0].transcript)
        .join("");
      setInput(transcript);
      if (event.results[event.results.length - 1].isFinal) {
        sendMessage(transcript);
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const clearChat = () => {
    const welcome: Message = {
      id: "welcome",
      role: "assistant",
      content: WELCOME_MSG,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcome]);
    saveMessages([welcome]);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RubyAvatar size="w-9 h-9" />
          <div>
            <h2 className="text-gray-900 font-semibold text-base sm:text-lg">Chat with Ruby</h2>
            <p className="text-gray-500 text-xs sm:text-sm hidden sm:block">Ask any question — I&apos;m here to help you learn</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-100 text-orange-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-orange-200 transition-colors"
            >
              <span className="animate-pulse">🔊</span> Stop
            </button>
          )}
          <button
            onClick={clearChat}
            className="px-2.5 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg text-xs sm:text-sm transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {msg.role === "assistant" ? (
              <RubyAvatar />
            ) : (
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold bg-blue-500 text-white">
                Y
              </div>
            )}
            <div
              className={`max-w-[88%] sm:max-w-[75%] rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 ${
                msg.role === "user"
                  ? "bg-blue-500 text-white rounded-tr-sm"
                  : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {msg.content || "▌"}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              )}
              <p className={`text-xs mt-2 ${msg.role === "user" ? "text-blue-200" : "text-gray-400"}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.content === "" && (
          <div className="flex gap-3">
            <RubyAvatar />
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm">
              <div className="flex gap-1.5 items-center h-5">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-3 py-3 sm:px-6 sm:py-4">
        {/* Attached file indicator */}
        {attachedFile && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 flex items-center gap-1.5">
              📎 {attachedFile.name}
              <button onClick={() => setAttachedFile(null)} className="ml-1 text-blue-400 hover:text-blue-600 font-bold leading-none">×</button>
            </span>
          </div>
        )}

        <div className="flex items-end gap-2 sm:gap-3">
          {/* Upload button (left of textarea) */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            title="Upload image or PDF"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,application/pdf"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows={1}
              className="w-full bg-transparent px-4 py-3 text-gray-800 placeholder-gray-400 text-sm resize-none outline-none max-h-40 overflow-y-auto"
              style={{ height: "auto" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${target.scrollHeight}px`;
              }}
              disabled={isLoading}
            />
          </div>

          <button
            onClick={isListening ? stopVoice : startVoice}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              isListening
                ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            title={isListening ? "Stop listening" : "Voice input"}
          >
            {isListening ? "⏹" : "🎤"}
          </button>

          <button
            onClick={() => sendMessage(input)}
            disabled={(!input.trim() && !attachedFile) || isLoading}
            className="w-11 h-11 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/40"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
