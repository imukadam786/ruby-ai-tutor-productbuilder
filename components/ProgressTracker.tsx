"use client";

import { getProgress, getLessons } from "@/lib/storage";
import { useMemo } from "react";

export default function ProgressTracker() {
  const progress = useMemo(() => getProgress(), []);
  const lessons = useMemo(() => getLessons(), []);

  const completedLessons = lessons.filter((l) => l.completed);
  const inProgressLessons = lessons.filter((l) => !l.completed);

  const lastSessionDate = progress.lastSession
    ? new Date(progress.lastSession).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "No sessions yet";

  const topSubjects = Object.entries(progress.subjectBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const maxCount = Math.max(...topSubjects.map(([, c]) => c), 1);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h2 className="text-gray-900 font-semibold text-lg">Your Progress</h2>
        <p className="text-gray-500 text-sm">Track your learning journey</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Key stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              {
                label: "Messages Sent",
                value: progress.totalMessages,
                icon: "💬",
                color: "blue",
              },
              {
                label: "Topics Studied",
                value: progress.topicsStudied.length,
                icon: "🧠",
                color: "purple",
              },
              {
                label: "Lessons Done",
                value: progress.lessonsCompleted,
                icon: "✅",
                color: "green",
              },
              {
                label: "Study Sessions",
                value: progress.sessionCount,
                icon: "🎯",
                color: "orange",
              },
            ].map(({ label, value, icon, color }) => (
              <div
                key={label}
                className="bg-white border border-gray-200 rounded-2xl p-5 text-center shadow-sm"
              >
                <div className="text-3xl mb-2">{icon}</div>
                <div
                  className={`text-2xl font-bold text-${color}-600`}
                >
                  {value}
                </div>
                <div className="text-gray-500 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Last session */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-1">Last Session</h3>
            <p className="text-gray-500 text-sm">{lastSessionDate}</p>
          </div>

          {/* Subject breakdown */}
          {topSubjects.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Subject Breakdown</h3>
              <div className="space-y-3">
                {topSubjects.map(([subject, count]) => (
                  <div key={subject}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{subject}</span>
                      <span className="text-gray-400">
                        {count} lesson{count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Topics list */}
          {progress.topicsStudied.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">Topics Studied</h3>
              <div className="flex flex-wrap gap-2">
                {progress.topicsStudied.map((topic) => (
                  <span
                    key={topic}
                    className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Lessons status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-green-500">✅</span> Completed Lessons
              </h3>
              {completedLessons.length === 0 ? (
                <p className="text-gray-400 text-sm">No completed lessons yet</p>
              ) : (
                <ul className="space-y-2">
                  {completedLessons.map((l) => (
                    <li key={l.id} className="text-sm text-gray-700">
                      <span className="font-medium">{l.topic}</span>
                      <span className="text-gray-400 text-xs ml-1">({l.subject})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-blue-500">📖</span> In Progress
              </h3>
              {inProgressLessons.length === 0 ? (
                <p className="text-gray-400 text-sm">No lessons in progress</p>
              ) : (
                <ul className="space-y-2">
                  {inProgressLessons.map((l) => (
                    <li key={l.id} className="text-sm text-gray-700">
                      <span className="font-medium">{l.topic}</span>
                      <span className="text-gray-400 text-xs ml-1">({l.subject})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Empty state */}
          {progress.totalMessages === 0 && progress.topicsStudied.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-5xl mb-3">🌱</p>
              <p className="font-medium text-gray-600">Your learning journey starts here!</p>
              <p className="text-sm mt-1">
                Start chatting with Rub or generate a lesson plan to track your progress.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
