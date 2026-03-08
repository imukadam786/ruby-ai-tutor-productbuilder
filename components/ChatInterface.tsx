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

// Convert file to base64 string
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix (e.g. "data:image/jpeg;base64,")
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function RubyAvatar({ size = "w-16 h-16" }: { size?: string }) {
  return (
    <div className={`${size} rounded-full flex-shrink-0 overflow-hidden`}>
      <img
        src="/ruby-avatar.png"
        alt="Ruby"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = "block";
        }}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ display: "none" }}
      >
        <circle cx="50" cy="50" r="50" fill="#f3f0ff" />
        <ellipse cx="50" cy="82" rx="28" ry="22" fill="#e02020" />
        <ellipse cx="50" cy="78" rx="18" ry="16" fill="#ff4444" />
        <polygon points="50,62 44,68 50,74 56,68" fill="#fff" opacity="0.9" />
        <rect x="44" y="52" width="12" height="10" rx="4" fill="#f9c9a0" />
        <ellipse cx="50" cy="44" rx="18" ry="18" fill="#f9c9a0" />
        <ellipse cx="50" cy="28" rx="18" ry="10" fill="#cc1a1a" />
        <ellipse cx="34" cy="42" rx="7" ry="12" fill="#cc1a1a" />
        <ellipse cx="66" cy="42" rx="7" ry="12" fill="#cc1a1a" />
        <ellipse cx="36" cy="56" rx="5" ry="7" fill="#cc1a1a" />
        <ellipse cx="64" cy="56" rx="5" ry="7" fill="#cc1a1a" />
        <ellipse cx="50" cy="28" rx="22" ry="5" fill="#aa0000" />
        <ellipse cx="50" cy="20" rx="14" ry="12" fill="#cc1a1a" />
        <rect x="36" y="24" width="28" height="5" rx="2" fill="#aa0000" />
        <ellipse cx="44" cy="44" rx="3.5" ry="4" fill="#2d1a0e" />
        <ellipse cx="56" cy="44" rx="3.5" ry="4" fill="#2d1a0e" />
        <circle cx="45.5" cy="42.5" r="1.2" fill="white" />
        <circle cx="57.5" cy="42.5" r="1.2" fill="white" />
        <ellipse cx="40" cy="50" rx="4" ry="2.5" fill="#ffaaaa" opacity="0.6" />
        <ellipse cx="60" cy="50" rx="4" ry="2.5" fill="#ffaaaa" opacity="0.6" />
        <path d="M44 53 Q50 58 56 53" stroke="#c0776a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
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
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = getMessages();
    if (saved.length > 0) {
      setMessages(saved);
    } else {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: WELCOME_MSG,
        timestamp: new Date().toISOString(),
      }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close upload menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(e.target as Node)) {
        setShowUploadMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleFileSelected = (file: File) => {
    setAttachedFile(file);
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setAttachedPreview(url);
    } else {
      setAttachedPreview(null);
    }
    setShowUploadMenu(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
    e.target.value = "";
  };

  const removeAttachment = () => {
    if (attachedPreview) URL.revokeObjectURL(attachedPreview);
    setAttachedFile(null);
    setAttachedPreview(null);
  };

  const sendMessage = useCallback(
    async (text: string) => {
      const hasAttachment = !!attachedFile;
      const isImage = hasAttachment && attachedFile!.type.startsWith("image/");
      const messageText = text.trim() || (hasAttachment ? "" : "");

      if (!messageText && !hasAttachment) return;
      if (isLoading) return;

      // Display text — show file name for non-image attachments
      const displayText = !isImage && hasAttachment
        ? `${messageText}${messageText ? "\n" : ""}📎 ${attachedFile!.name}`
        : messageText;

      const userMessage: Message = {
        id: `user_${Date.now()}`,
        role: "user",
        content: displayText,
        timestamp: new Date().toISOString(),
      };

      // Store preview URL to show in UI (will be in imagePreviewMap)
      const previewUrl = attachedPreview;
      const capturedFile = attachedFile;

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");
      removeAttachment();
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
        let imageData: string | undefined;
        let imageMimeType: string | undefined;

        if (isImage && capturedFile) {
          imageData = await fileToBase64(capturedFile);
          imageMimeType = capturedFile.type;
        }

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages,
            imageData,
            imageMimeType,
          }),
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
            prev.map((m) => m.id === assistantMessage.id ? { ...m, content: fullText } : m)
          );
        }

        saveMessages(updatedMessages.concat({ ...assistantMessage, content: fullText }));
        incrementMessageCount();
        onMessageSent();

        if (fullText && "speechSynthesis" in window) {
          const plain = fullText.replace(/[#*`_\[\]()]/g, "").replace(/\n+/g, " ");
          const utt = new SpeechSynthesisUtterance(plain.slice(0, 500));
          utt.onstart = () => setIsSpeaking(true);
          utt.onend = () => setIsSpeaking(false);
          window.speechSynthesis.speak(utt);
        }

        // Clean up preview URL after sending
        if (previewUrl) URL.revokeObjectURL(previewUrl);
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
    [messages, isLoading, onMessageSent, attachedFile, attachedPreview]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
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
        .map((r: any) => r[0].transcript).join("");
      setInput(transcript);
      if (event.results[event.results.length - 1].isFinal) sendMessage(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoice = () => { recognitionRef.current?.stop(); setIsListening(false); };
  const stopSpeaking = () => { window.speechSynthesis.cancel(); setIsSpeaking(false); };

  const clearChat = () => {
    const welcome: Message = {
      id: "welcome", role: "assistant", content: WELCOME_MSG,
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
          <RubyAvatar size="w-16 h-16" />
          <div>
            <h2 className="text-gray-900 font-semibold text-base sm:text-lg">Chat with Ruby</h2>
            <p className="text-gray-500 text-xs sm:text-sm hidden sm:block">Ask any question — I&apos;m here to help you learn</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <button onClick={stopSpeaking} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-100 text-orange-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-orange-200 transition-colors">
              <span className="animate-pulse">🔊</span> Stop
            </button>
          )}
          <button onClick={clearChat} className="px-2.5 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg text-xs sm:text-sm transition-colors">
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            {msg.role === "assistant" ? (
              <RubyAvatar />
            ) : (
              <div className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-bold bg-blue-500 text-white">
                Y
              </div>
            )}
            <div className={`max-w-[85%] sm:max-w-[72%] rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 ${
              msg.role === "user"
                ? "bg-blue-500 text-white rounded-tr-sm"
                : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"
            }`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
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

      {/* Input area */}
      <div className="bg-white border-t border-gray-200 px-3 py-3 sm:px-6 sm:py-4">

        {/* Attachment preview */}
        {attachedFile && (
          <div className="flex items-center gap-2 mb-2 px-1">
            {attachedPreview ? (
              <div className="relative inline-flex">
                <img src={attachedPreview} alt="preview" className="h-16 w-16 object-cover rounded-xl border border-gray-200" />
                <button
                  onClick={removeAttachment}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 text-white rounded-full text-xs flex items-center justify-center leading-none"
                >×</button>
              </div>
            ) : (
              <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 flex items-center gap-1.5">
                📎 {attachedFile.name}
                <button onClick={removeAttachment} className="ml-1 text-blue-400 hover:text-blue-600 font-bold leading-none">×</button>
              </span>
            )}
          </div>
        )}

        <div className="flex items-end gap-2 sm:gap-3">

          {/* Upload button with popover */}
          <div className="relative flex-shrink-0" ref={uploadMenuRef}>
            <button
              onClick={() => setShowUploadMenu((v) => !v)}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              title="Upload file or take photo"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            {/* Popover menu */}
            {showUploadMenu && (
              <div className="absolute bottom-14 left-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 w-44 z-50">
                <button
                  onClick={() => { setShowUploadMenu(false); fileInputRef.current?.click(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
                >
                  <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  File
                </button>
                <button
                  onClick={() => { setShowUploadMenu(false); cameraInputRef.current?.click(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
                >
                  <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  Camera
                </button>
              </div>
            )}
          </div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
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
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = `${t.scrollHeight}px`;
              }}
              disabled={isLoading}
            />
          </div>

          <button
            onClick={isListening ? stopVoice : startVoice}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
              isListening ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            title={isListening ? "Stop listening" : "Voice input"}
          >
            {isListening ? "⏹" : "🎤"}
          </button>

          <button
            onClick={() => sendMessage(input)}
            disabled={(!input.trim() && !attachedFile) || isLoading}
            className="w-11 h-11 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 flex-shrink-0"
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
