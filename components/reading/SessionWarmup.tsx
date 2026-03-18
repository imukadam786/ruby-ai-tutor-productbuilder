"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  WarmupBankQuestion,
  WarmupResult,
  loadWarmupQuestions,
  WARMUP_SKILL_LABELS,
  scoreVoiceWarmup,
} from "@/lib/reading-warmup";

interface SessionWarmupProps {
  skillIds: string[];
  bankIndex: number;
  studentName: string;
  onComplete: (results: WarmupResult[]) => void;
}

type WarmupPhase = "intro" | "question" | "feedback" | "done";

export default function SessionWarmup({ skillIds, bankIndex, studentName, onComplete }: SessionWarmupProps) {
  const [phase, setPhase] = useState<WarmupPhase>("intro");
  const [questions, setQuestions] = useState<WarmupBankQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<WarmupResult[]>([]);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    loadWarmupQuestions(skillIds, bankIndex).then((qs) => {
      setQuestions(qs);
    });
  }, [skillIds, bankIndex]);

  const currentQuestion = questions[currentIndex] ?? null;
  const total = questions.length;

  const submitAnswer = useCallback(
    (response: string, correct: boolean) => {
      if (!currentQuestion) return;
      const result: WarmupResult = {
        skillId: currentQuestion.skillId,
        questionId: currentQuestion.id,
        correct,
        response,
      };
      const updated = [...results, result];
      setResults(updated);
      setLastCorrect(correct);
      setPhase("feedback");

      setTimeout(() => {
        if (currentIndex + 1 >= total) {
          setPhase("done");
          onComplete(updated);
        } else {
          setCurrentIndex((i) => i + 1);
          setSelectedChoice(null);
          setTranscript("");
          setPhase("question");
        }
      }, 1200);
    },
    [currentQuestion, results, currentIndex, total, onComplete]
  );

  const handleChoiceSelect = useCallback(
    (choice: { label: string; value: string; correct: boolean }) => {
      if (phase !== "question") return;
      setSelectedChoice(choice.value);
      submitAnswer(choice.label, choice.correct);
    },
    [phase, submitAnswer]
  );

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as typeof window & { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as typeof window & { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const t = e.results[0]?.[0]?.transcript ?? "";
      setTranscript(t);
      setIsListening(false);
      if (currentQuestion?.expectedAnswer) {
        const correct = scoreVoiceWarmup(t, currentQuestion.expectedAnswer);
        submitAnswer(t, correct);
      }
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  }, [currentQuestion, submitAnswer]);

  const getStimulus = (q: WarmupBankQuestion): string | null => {
    return q.passage ?? q.sentence ?? q.text ?? null;
  };

  // ── Intro screen ──
  if (phase === "intro" || questions.length === 0) {
    return (
      <div className="flex flex-col h-full bg-gray-50 items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center space-y-5">
          <div className="text-4xl">🎯</div>
          <h2 className="text-xl font-bold text-gray-800">Quick warm-up, {studentName.split(" ")[0]}!</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Before today's lesson, let's do {total} quick question{total !== 1 ? "s" : ""}. It only takes a minute!
          </p>
          <div className="flex justify-center gap-1.5 pt-1">
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full bg-gray-200" />
            ))}
          </div>
          <button
            onClick={() => setPhase("question")}
            disabled={questions.length === 0}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold text-base hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-40"
          >
            Let's go →
          </button>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="flex flex-col h-full bg-gray-50 items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center space-y-4">
          <div className="text-4xl">⭐</div>
          <h2 className="text-xl font-bold text-gray-800">Great work!</h2>
          <p className="text-gray-500 text-sm">Now let's get into today's lesson.</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const stimulus = getStimulus(currentQuestion);
  const skillLabel = WARMUP_SKILL_LABELS[currentQuestion.skillId] ?? currentQuestion.domain;
  const isFeedback = phase === "feedback";

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Progress bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Warm-up</span>
          <span className="text-xs text-gray-400">{currentIndex + 1} / {total}</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-2">
        <div className="max-w-xl mx-auto space-y-4">
          {/* Skill label chip */}
          <div className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-100 rounded-full px-3 py-1">
            <span className="text-xs text-purple-600 font-medium">{skillLabel}</span>
          </div>

          {/* Stimulus passage/sentence/text */}
          {stimulus && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-gray-700 text-sm leading-relaxed italic">{stimulus}</p>
            </div>
          )}

          {/* Display word for voice */}
          {currentQuestion.displayWord && !stimulus && (
            <div className="bg-white border border-gray-100 rounded-xl p-6 text-center">
              <p className="text-4xl font-bold text-gray-800 tracking-wide">
                {currentQuestion.displayWord}
              </p>
            </div>
          )}

          {/* Question card */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <p className="text-gray-800 font-medium text-base leading-snug mb-4">
              {currentQuestion.question}
            </p>

            {/* Tap / Choice mode */}
            {currentQuestion.answerMode === "choice" && currentQuestion.choices && (
              <div className="grid grid-cols-1 gap-2.5">
                {currentQuestion.choices.map((choice) => {
                  const isSelected = selectedChoice === choice.value;
                  return (
                    <button
                      key={choice.value}
                      onClick={() => handleChoiceSelect(choice)}
                      disabled={isFeedback}
                      className={[
                        "w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                        isFeedback && isSelected && choice.correct
                          ? "bg-green-50 border-green-400 text-green-800"
                          : isFeedback && isSelected && !choice.correct
                          ? "bg-red-50 border-red-400 text-red-800"
                          : isFeedback && !isSelected && choice.correct
                          ? "bg-green-50 border-green-300 text-green-700"
                          : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300 active:scale-95",
                      ].join(" ")}
                    >
                      {choice.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Voice mode */}
            {currentQuestion.answerMode === "voice" && (
              <div className="flex flex-col items-center gap-4 pt-2">
                {transcript && (
                  <p className="text-gray-500 text-sm italic">You said: "{transcript}"</p>
                )}
                {isFeedback ? (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${lastCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {lastCorrect ? "✓ Great!" : "✗ Not quite"}
                  </div>
                ) : (
                  <button
                    onClick={startListening}
                    disabled={isListening}
                    className={[
                      "flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all",
                      isListening
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-purple-600 text-white hover:bg-purple-700 active:scale-95",
                    ].join(" ")}
                  >
                    {isListening ? "🎙 Listening..." : "🎙 Tap to speak"}
                  </button>
                )}
              </div>
            )}

            {/* Feedback overlay */}
            {isFeedback && currentQuestion.answerMode === "choice" && (
              <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${lastCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {lastCorrect ? "✓ Correct!" : "✗ Not quite — moving on"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
