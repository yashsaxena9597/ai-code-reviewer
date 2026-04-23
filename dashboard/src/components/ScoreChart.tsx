import React from 'react';

interface ScoreChartProps {
  scores: { date: string; score: number }[];
}

const ScoreChart: React.FC<ScoreChartProps> = ({ scores }) => {
  if (scores.length === 0) {
    return <p className="text-gray-400">No data available</p>;
  }

  const maxScore = 10;
  const chartHeight = 200;
  const chartWidth = Math.max(scores.length * 50, 300);

  return (
    <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
      <h3 className="text-white font-semibold mb-4">Quality Score Trend</h3>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="w-full" style={{ minWidth: chartWidth }}>
        {/* Grid lines */}
        {[0, 2, 4, 6, 8, 10].map((val) => {
          const y = chartHeight - (val / maxScore) * chartHeight;
          return (
            <g key={val}>
              <line x1="30" y1={y} x2={chartWidth} y2={y} stroke="#374151" strokeWidth="1" />
              <text x="0" y={y + 4} fill="#9CA3AF" fontSize="11">
                {val}
              </text>
            </g>
          );
        })}

        {/* Score line */}
        <polyline
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2"
          points={scores
            .map((s, i) => {
              const x = 40 + i * 50;
              const y = chartHeight - (s.score / maxScore) * chartHeight;
              return `${x},${y}`;
            })
            .join(' ')}
        />

        {/* Score dots */}
        {scores.map((s, i) => {
          const x = 40 + i * 50;
          const y = chartHeight - (s.score / maxScore) * chartHeight;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill={s.score >= 6 ? '#10B981' : '#EF4444'} />
              <text x={x} y={chartHeight + 20} fill="#9CA3AF" fontSize="9" textAnchor="middle">
                {new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </text>
            </g>
          );
        })}

        {/* Pass threshold line */}
        <line
          x1="30"
          y1={chartHeight - (6 / maxScore) * chartHeight}
          x2={chartWidth}
          y2={chartHeight - (6 / maxScore) * chartHeight}
          stroke="#EF4444"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
      </svg>
    </div>
  );
};

export default ScoreChart;
