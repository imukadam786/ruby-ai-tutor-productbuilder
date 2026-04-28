"use client";

import { useMemo } from "react";

interface Props {
  masteredInLevel: number;
  totalInLevel: number;
  nextLevelName?: string;
  dailyActivity: Record<string, number>;
  color: "blue" | "purple";
}

const VW = 300;
const VH = 114;
const ML = 24;
const MR = 12;
const MT = 18;
const MB = 22;
const CW = VW - ML - MR;
const CH = VH - MT - MB;

export default function LearningForecastGraph({
  masteredInLevel,
  totalInLevel,
  nextLevelName,
  dailyActivity,
  color,
}: Props) {
  const remaining = totalInLevel - masteredInLevel;

  const { solidPoints, dotPoints, daysToComplete, totalDays, todayDayIdx } =
    useMemo(() => {
      const sortedEntries = Object.entries(dailyActivity).sort(([a], [b]) =>
        a.localeCompare(b)
      );
      const activeDays = sortedEntries.length;
      const totalSessions = sortedEntries.reduce((s, [, n]) => s + n, 0);

      const skillsPerSession =
        totalSessions > 0 && masteredInLevel > 0
          ? masteredInLevel / totalSessions
          : 0;
      const avgSessionsPerDay =
        activeDays > 0 ? totalSessions / activeDays : 0.5;
      const skillsPerDay = skillsPerSession * avgSessionsPerDay;

      // Historical (solid) line
      const solidPoints: { day: number; v: number }[] = [{ day: 0, v: 0 }];
      let accumulated = 0;
      sortedEntries.forEach(([, sessions], i) => {
        accumulated += sessions * skillsPerSession;
        solidPoints.push({
          day: i + 1,
          v: Math.min(accumulated, masteredInLevel),
        });
      });
      if (solidPoints.length > 1) {
        solidPoints[solidPoints.length - 1].v = masteredInLevel;
      }

      const todayDayIdx = Math.max(activeDays, 1);
      const rem = totalInLevel - masteredInLevel;
      const daysToComplete =
        skillsPerDay > 0
          ? Math.max(1, Math.ceil(rem / skillsPerDay))
          : Math.max(rem * 3, 7);

      // Forecast (dotted) line
      const dotPoints: { day: number; v: number }[] = [
        { day: todayDayIdx, v: masteredInLevel },
      ];
      const steps = Math.min(daysToComplete, 60);
      for (let d = 1; d <= steps; d++) {
        dotPoints.push({
          day: todayDayIdx + d,
          v: Math.min(masteredInLevel + d * skillsPerDay, totalInLevel),
        });
      }

      const totalDays = todayDayIdx + steps;
      return { solidPoints, dotPoints, daysToComplete, totalDays, todayDayIdx };
    }, [masteredInLevel, totalInLevel, dailyActivity]);

  if (totalInLevel === 0) return null;

  const pc = color === "blue" ? "#3B82F6" : "#9333EA";
  const dc = color === "blue" ? "#1D4ED8" : "#7E22CE";
  const chipCls =
    color === "blue"
      ? "bg-blue-50 text-blue-600"
      : "bg-purple-50 text-purple-600";

  const sx = (day: number) => ML + (day / Math.max(totalDays, 1)) * CW;
  const sy = (v: number) => MT + CH - (v / Math.max(totalInLevel, 1)) * CH;

  const toPath = (pts: { day: number; v: number }[]) =>
    pts
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"}${sx(p.day).toFixed(1)} ${sy(p.v).toFixed(1)}`
      )
      .join(" ");

  const todayX = sx(todayDayIdx);
  const todayY = sy(masteredInLevel);
  const endX = sx(dotPoints[dotPoints.length - 1].day);
  const endY = sy(totalInLevel);

  // Keep "you are here" label from clipping
  const hereAnchor =
    todayX < ML + CW * 0.5 ? "start" : todayX > ML + CW * 0.8 ? "end" : "middle";
  const hereLabelX =
    hereAnchor === "start" ? todayX + 2 : hereAnchor === "end" ? todayX - 2 : todayX;
  const labelAbove = todayY > MT + CH * 0.4;
  const hereLabelY = labelAbove ? todayY - 12 : todayY + 16;

  // "Set complete" label: push left if near right edge
  const setCompleteX = Math.min(endX, ML + CW - 2);

  return (
    <div className="mt-2 mb-3">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="w-full"
        style={{ height: 124 }}
        aria-hidden="true"
      >
        {/* Axes */}
        <line x1={ML} y1={MT} x2={ML} y2={MT + CH} stroke="#F3F4F6" strokeWidth="1" />
        <line x1={ML} y1={MT + CH} x2={ML + CW} y2={MT + CH} stroke="#F3F4F6" strokeWidth="1" />
        {/* Mid gridline */}
        <line
          x1={ML} y1={MT + CH / 2}
          x2={ML + CW} y2={MT + CH / 2}
          stroke="#F9FAFB" strokeWidth="0.5" strokeDasharray="4 3"
        />

        {/* Y-axis labels */}
        <text x={ML - 3} y={MT + 4} textAnchor="end" fontSize="8" fill="#D1D5DB">
          {totalInLevel}
        </text>
        <text x={ML - 3} y={MT + CH + 1} textAnchor="end" fontSize="8" fill="#D1D5DB">
          0
        </text>

        {/* Dotted forecast line */}
        {remaining > 0 && dotPoints.length > 1 && (
          <path
            d={toPath(dotPoints)}
            fill="none"
            stroke={pc}
            strokeWidth="1.5"
            strokeDasharray="5 3"
            strokeOpacity="0.5"
          />
        )}

        {/* Solid historical line */}
        {solidPoints.length > 1 && (
          <path
            d={toPath(solidPoints)}
            fill="none"
            stroke={pc}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* "You are here" dot */}
        <circle cx={todayX} cy={todayY} r="9" fill={pc} fillOpacity="0.12" />
        <circle cx={todayX} cy={todayY} r="5" fill={pc} />

        {/* "You are here" label */}
        <text
          x={hereLabelX}
          y={hereLabelY}
          textAnchor={hereAnchor}
          fontSize="7.5"
          fill={dc}
          fontWeight="700"
        >
          You are here
        </text>

        {/* Set complete marker */}
        {remaining > 0 && dotPoints.length > 1 && (
          <>
            <circle cx={endX} cy={endY} r="5" fill="white" stroke={pc} strokeWidth="1.5" />
            <text
              x={setCompleteX}
              y={endY - 9}
              textAnchor="end"
              fontSize="7"
              fill="#6B7280"
              fontWeight="600"
            >
              Set complete
            </text>
            <text
              x={setCompleteX}
              y={endY + 1}
              textAnchor="end"
              fontSize="6.5"
              fill="#9CA3AF"
            >
              → Diagnostic 2
            </text>
          </>
        )}

        {/* Level complete state */}
        {remaining === 0 && (
          <text
            x={ML + CW / 2}
            y={MT + CH / 2}
            textAnchor="middle"
            fontSize="9"
            fill={dc}
            fontWeight="700"
          >
            Level complete! 🎉
          </text>
        )}

        {/* X-axis: Day 1 */}
        <text x={ML} y={VH - 2} textAnchor="start" fontSize="7" fill="#D1D5DB">
          Day 1
        </text>
        {/* X-axis: Today */}
        <text
          x={todayX}
          y={VH - 2}
          textAnchor="middle"
          fontSize="7.5"
          fill={pc}
          fontWeight="700"
        >
          Today
        </text>
        {/* X-axis: projected end */}
        {remaining > 0 && dotPoints.length > 1 && (
          <text
            x={Math.min(endX, ML + CW)}
            y={VH - 2}
            textAnchor="end"
            fontSize="7"
            fill="#9CA3AF"
          >
            +{daysToComplete}d
          </text>
        )}
      </svg>

      {/* Info chips */}
      <div className="flex flex-wrap gap-2 mt-1">
        {remaining > 0 ? (
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${chipCls}`}>
            ~{daysToComplete} day{daysToComplete !== 1 ? "s" : ""} to finish this level
          </span>
        ) : (
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-50 text-green-600">
            Level complete!
          </span>
        )}
        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-600">
          {masteredInLevel}/{totalInLevel} skills done
        </span>
        {nextLevelName && (
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-50 text-green-600">
            Next: {nextLevelName}
          </span>
        )}
      </div>
    </div>
  );
}
