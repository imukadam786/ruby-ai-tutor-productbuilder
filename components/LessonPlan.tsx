"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { LessonPlan as LessonPlanType } from "@/types";
import { getLessons, saveLesson, updateProgress, getProgress } from "@/lib/storage";

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology",
  "Computer Science", "History", "Literature", "Economics",
  "Geography", "Psychology", "Philosophy", "Language",
];

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

interface LessonPlanProps {
  onLessonCompleted: () => void;
}

export default function LessonPlan({ onLessonCompleted }: LessonPlanProps) {
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [level, setLevel] = useState("Beginner");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<LessonPlanType | null>(null);
  const [savedLessons, setSavedLessons] = useState<LessonPlanType[]>(() => getLessons());
  const [activeSection, setActiveSection] = useState(0);
  const [view, setView] = useState<"generate" | "reading" | "library">("generate");

  const generateLesson = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, subject, level }),
      });
      if (!res.ok) throw new Error("Failed to generate lesson");
      const lesson: LessonPlanType = await res.json();
      saveLesson(lesson);
      setSavedLessons(getLessons());
      setCurrentLesson(lesson);
      setActiveSection(0);
      setView("reading");

      const progress = getProgress();
      updateProgress({
        lessonsStarted: progress.lessonsStarted + 1,
        topicsStudied: progress.topicsStudied.includes(topic)
          ? progress.topicsStudied
          : [...progress.topicsStudied, topic],
        subjectBreakdown: {
          ...progress.subjectBreakdown,
          [subject]: (progress.subjectBreakdown[subject] || 0) + 1,
        },
      });
    } catch (e) {
      console.error(e);
      alert("Failed to generate lesson. Please check your API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const completeLesson = () => {
    if (!currentLesson) return;
    const updated = { ...currentLesson, completed: true };
    saveLesson(updated);
    setSavedLessons(getLessons());
    setCurrentLesson(updated);
    const progress = getProgress();
    updateProgress({ lessonsCompleted: progress.lessonsCompleted + 1 });
    onLessonCompleted();
  };

  const openLesson = (lesson: LessonPlanType) => {
    setCurrentLesson(lesson);
    setActiveSection(0);
    setView("reading");
  };

  if (view === "reading" && currentLesson) {
    const section = currentLesson.sections[activeSection];
    return (
      <div className="flex h-full bg-gray-50">
        {/* Desktop section nav */}
        <div className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200">
          <div className="px-4 py-4 border-b border-gray-200">
            <button
              onClick={() => setView("generate")}
              className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
            >
              ← Back
            </button>
            <h3 className="font-semibold text-gray-900 mt-2 text-sm leading-snug">
              {currentLesson.topic}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {currentLesson.subject} · {currentLesson.level}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto py-3">
            {currentLesson.sections.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveSection(i)}
                className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                  activeSection === i
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-500 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="text-xs text-gray-400 block">Section {i + 1}</span>
                {s.title}
              </button>
            ))}
          </div>
          {!currentLesson.completed && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={completeLesson}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                Mark Complete
              </button>
            </div>
          )}
          {currentLesson.completed && (
            <div className="p-4 border-t border-gray-200">
              <div className="bg-green-50 text-green-700 text-sm text-center py-2 rounded-xl font-medium">
                Completed!
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Mobile section selector */}
          <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setView("generate")}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                ← Back
              </button>
              <span className="text-gray-400 text-xs">·</span>
              <span className="text-sm text-gray-700 font-medium truncate">{currentLesson.topic}</span>
            </div>
            <select
              value={activeSection}
              onChange={(e) => setActiveSection(parseInt(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {currentLesson.sections.map((s, i) => (
                <option key={i} value={i}>
                  {i + 1}. {s.title}
                </option>
              ))}
            </select>
            <div className="mt-2">
              {!currentLesson.completed ? (
                <button
                  onClick={completeLesson}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Mark Complete
                </button>
              ) : (
                <div className="bg-green-50 text-green-700 text-sm text-center py-2 rounded-xl font-medium">
                  Completed!
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-5 sm:px-8 sm:py-8">
              {activeSection === 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
                  <p className="text-blue-800 text-sm font-medium">Lesson Overview</p>
                  <p className="text-blue-700 text-sm mt-1">{currentLesson.summary}</p>
                </div>
              )}

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{section.title}</h2>
              <p className="text-gray-400 text-sm mb-6">
                Section {activeSection + 1} of {currentLesson.sections.length}
              </p>

              <div className="prose prose-sm max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {section.content}
                </ReactMarkdown>
              </div>

              {section.examples && section.examples.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Examples</h3>
                  <div className="space-y-3">
                    {section.examples.map((ex, i) => (
                      <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {ex}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {section.practice && (
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 sm:p-5">
                  <p className="font-semibold text-yellow-800 mb-2">Practice</p>
                  <div className="prose prose-sm max-w-none text-yellow-900">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {section.practice}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                  disabled={activeSection === 0}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-400 text-sm self-center">
                  {activeSection + 1} / {currentLesson.sections.length}
                </span>
                <button
                  onClick={() =>
                    setActiveSection(Math.min(currentLesson.sections.length - 1, activeSection + 1))
                  }
                  disabled={activeSection === currentLesson.sections.length - 1}
                  className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 font-semibold text-base sm:text-lg">Lesson Plans</h2>
          <p className="text-gray-500 text-xs sm:text-sm hidden sm:block">AI-generated lessons on any topic</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("generate")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-sm font-medium transition-colors ${
              view === "generate"
                ? "bg-blue-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            New
          </button>
          <button
            onClick={() => setView("library")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-sm font-medium transition-colors ${
              view === "library"
                ? "bg-blue-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Library ({savedLessons.length})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {view === "generate" ? (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-5">
              <h3 className="font-semibold text-gray-800 text-lg">Generate a Lesson</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Quadratic equations, Photosynthesis..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                  onKeyDown={(e) => e.key === "Enter" && generateLesson()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all bg-white"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Level</label>
                <div className="flex gap-2 sm:gap-3">
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        level === l
                          ? "bg-blue-500 text-white border-blue-500"
                          : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateLesson}
                disabled={!topic.trim() || isGenerating}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating lesson...
                  </>
                ) : (
                  "Generate Lesson"
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {savedLessons.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">📚</p>
                <p className="font-medium">No lessons yet</p>
                <p className="text-sm mt-1">Generate your first lesson to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedLessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => openLesson(lesson)}
                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 text-left hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{lesson.topic}</h4>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {lesson.subject} · {lesson.level}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(lesson.createdAt).toLocaleDateString()} · {lesson.sections.length} sections
                        </p>
                      </div>
                      <span
                        className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${
                          lesson.completed
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {lesson.completed ? "Done" : "In Progress"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
