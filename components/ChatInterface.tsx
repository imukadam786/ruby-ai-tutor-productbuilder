"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Message } from "@/types";
import { getMessages, saveMessages, incrementMessageCount } from "@/lib/storage";
import { useT } from "@/lib/i18n";

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

import { speakViaAPI } from "@/lib/tts";

// Alias so all call sites remain unchanged
const speakNaturally = speakViaAPI;
// ─────────────────────────────────────────────────────────────────────────────

export default function ChatInterface({ onMessageSent }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const cancelSpeechRef = useRef<(() => void) | null>(null);
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

  // Scroll messages container without affecting page scroll (fixes mobile push-up)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
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

        // No auto-play — user can press play button on each message

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

  const stopSpeaking = () => {
    if (cancelSpeechRef.current) { cancelSpeechRef.current(); cancelSpeechRef.current = null; }
    setPlayingMsgId(null);
  };

  const togglePlay = (msgId: string, text: string) => {
    // If this message is already playing, stop it
    if (playingMsgId === msgId) { stopSpeaking(); return; }
    // Stop any other playing message first
    stopSpeaking();
    cancelSpeechRef.current = speakNaturally(
      text.slice(0, 1200),
      () => setPlayingMsgId(msgId),
      () => { setPlayingMsgId(null); cancelSpeechRef.current = null; }
    );
  };

  const clearChat = () => {
    const welcome: Message = {
      id: "welcome", role: "assistant", content: WELCOME_MSG,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcome]);
    saveMessages([welcome]);
  };

  // Mobile pencil icon → dispatches this event
  useEffect(() => {
    const handler = () => clearChat();
    document.addEventListener("ruby-action", handler);
    return () => document.removeEventListener("ruby-action", handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="hidden md:flex border-b border-gray-100 px-4 py-2 sm:px-8 sm:py-3 items-center justify-between bg-white">
        <div className="flex items-center gap-2.5">
          <RubyAvatar size="w-8 h-8 sm:w-10 sm:h-10" />
          <h2 className="text-gray-900 font-semibold text-base sm:text-lg">Chat with Ruby</h2>
        </div>
        <button
          onClick={clearChat}
          className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-all"
          title="Clear conversation"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "user" ? (
              /* User bubble */
              <div className="max-w-[80%] sm:max-w-[65%]">
                <div className="bg-[#B7182E] text-white rounded-2xl rounded-tr-sm px-4 py-3">
                  <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ) : (
              /* Ruby response — clean text, no card */
              <div className="max-w-[90%] sm:max-w-[75%]">
                <div className="prose prose-base max-w-none leading-relaxed prose-headings:text-gray-800 prose-headings:font-bold prose-headings:mt-5 prose-headings:mb-2 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:!mb-5 prose-p:!mt-0 prose-strong:text-gray-700 prose-strong:font-normal prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-100 prose-pre:rounded-xl prose-li:text-gray-700 prose-li:mb-1 prose-ul:mb-4 prose-ol:mb-4">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {msg.content || "▌"}
                  </ReactMarkdown>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-xs text-gray-400">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {msg.content && !msg.content.includes("▌") && (
                    <button
                      onClick={() => togglePlay(msg.id, msg.content)}
                      className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full transition-all ${
                        playingMsgId === msg.id
                          ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                          : "text-green-700 hover:text-green-800 hover:bg-green-50"
                      }`}
                      title={playingMsgId === msg.id ? "Stop" : "Play"}
                    >
                      {playingMsgId === msg.id ? (
                        <>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                          </svg>
                          Stop
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          Play
                        </>
                      )}
                    </button>
                  )}
                  {/* Hint button — only on the last Ruby message */}
                  {msg.id === [...messages].reverse().find(m => m.role === "assistant")?.id &&
                    msg.content && !msg.content.includes("▌") && !isLoading && (
                    <button
                      onClick={() => sendMessage("hint")}
                      className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full transition-all text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                      title="Get a hint"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Hint
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.content === "" && (
          <div className="flex justify-start">
            <div className="flex gap-1.5 items-center h-6 px-1">
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Input area */}
      <div className="px-4 pb-4 pt-2 sm:px-8 sm:pb-6 bg-white">
        <div className="max-w-3xl mx-auto">

        {/* Attachment preview */}
        {attachedFile && (
          <div className="flex items-center gap-2 mb-2 px-1">
            {attachedPreview ? (
              <div className="relative inline-flex">
                <img src={attachedPreview} alt="preview" className="h-14 w-14 object-cover rounded-xl border border-gray-200" />
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

        {/* GPT-style input container */}
        <div className="relative flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-sm">

          {/* Upload button (inside container, left) */}
          <div className="relative flex-shrink-0 self-end pb-0.5" ref={uploadMenuRef}>
            <button
              onClick={() => setShowUploadMenu((v) => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-500 hover:bg-white transition-colors"
              title="Attach file or photo"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {/* Popover menu */}
            {showUploadMenu && (
              <div className="absolute bottom-12 left-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 w-44 z-50">
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
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,application/pdf" className="hidden" onChange={handleFileChange} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={1}
            className="flex-1 bg-transparent py-1.5 text-gray-800 placeholder-gray-400 text-base resize-none outline-none max-h-36 overflow-y-auto leading-relaxed"
            style={{ height: "auto" }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "auto";
              t.style.height = `${t.scrollHeight}px`;
            }}
            disabled={isLoading}
          />

          {/* Right buttons */}
          <div className="flex items-end gap-1 flex-shrink-0 self-end pb-0.5">
            {/* Mic */}
            <button
              onClick={isListening ? stopVoice : startVoice}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                isListening ? "bg-red-100 text-red-500" : "text-gray-400 hover:text-gray-600 hover:bg-white"
              }`}
              title={isListening ? "Stop listening" : "Voice input"}
            >
              {isListening ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="1" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 3a4 4 0 014 4v4a4 4 0 01-8 0V7a4 4 0 014-4z" />
                </svg>
              )}
            </button>

            {/* Send */}
            <button
              onClick={() => sendMessage(input)}
              disabled={(!input.trim() && !attachedFile) || isLoading}
              className="w-8 h-8 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-all flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
              </svg>
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-2">Ruby can make mistakes. Double-check important info.</p>
        </div>
      </div>
    </div>
  );
}
