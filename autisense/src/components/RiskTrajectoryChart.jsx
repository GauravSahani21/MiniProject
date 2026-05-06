import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
} from 'recharts';

const COLORS = {
  low: '#16a34a',
  medium: '#f59e0b',
  high: '#dc2626',
  actual: '#2563eb',
  predicted: '#f97316',
};

function toLabel(date) {
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export function trendMeta(direction = 'Stable') {
  const normalized = String(direction || 'Stable').toLowerCase();
  if (normalized === 'worsening') {
    return { icon: '📈', label: 'Worsening', color: '#dc2626', bg: '#fee2e2' };
  }
  if (normalized === 'improving') {
    return { icon: '📉', label: 'Improving', color: '#16a34a', bg: '#dcfce7' };
  }
  return { icon: '➡️', label: 'Stable', color: '#a16207', bg: '#fef3c7' };
}

export default function RiskTrajectoryChart({ trajectoryData, height = 260 }) {
  const past = trajectoryData?.pastScreenings || [];
  const trendDirection = trajectoryData?.trend || 'Stable';
  const confidencePercent = trajectoryData?.confidencePercent ?? 0;
  const predictedNextScore = trajectoryData?.predictedNextScore;

  const chartData = useMemo(
    () => {
      if (!past.length) return [];
      const mapped = past.map((item) => ({
        label: toLabel(item.date),
        date: item.date,
        actualScore: item.score,
        predictedScore: null,
      }));

      mapped.push({
        label: 'Next',
        date: null,
        actualScore: null,
        predictedScore: predictedNextScore,
      });
      return mapped;
    },
    [past, predictedNextScore]
  );

  if (!past.length) {
    return (
      <div style={{ padding: 16, color: 'var(--muted)', fontSize: '0.85rem' }}>
        Trajectory data not available.
      </div>
    );
  }

  const trend = trendMeta(trendDirection);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <ReferenceArea y1={0} y2={2} fill="#dcfce7" fillOpacity={0.45} />
            <ReferenceArea y1={3} y2={7} fill="#fef3c7" fillOpacity={0.45} />
            <ReferenceArea y1={8} y2={20} fill="#fee2e2" fillOpacity={0.35} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis domain={[0, 20]} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip
              formatter={(value, name) => {
                if (value === null || value === undefined) return ['-', name];
                return [Number(value).toFixed(1), name];
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="actualScore"
              stroke={COLORS.actual}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 5 }}
              name="Past Scores"
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="predictedScore"
              stroke={COLORS.predicted}
              strokeWidth={3}
              strokeDasharray="6 5"
              dot={{ r: 4 }}
              activeDot={{ r: 5 }}
              name="Predicted Next Score"
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            borderRadius: 999,
            background: trend.bg,
            color: trend.color,
            fontSize: '0.78rem',
            fontWeight: 700,
          }}
        >
          <span>{trend.icon}</span>
          <span>{trend.label}</span>
        </div>
        <div
          style={{
            background: '#eef2ff',
            color: '#1e3a8a',
            borderRadius: 10,
            padding: '7px 10px',
            fontSize: '0.78rem',
            fontWeight: 700,
          }}
        >
          Predicted next score: {predictedNextScore ?? '-'} (Confidence: {confidencePercent}%)
        </div>
      </div>

      {past.length === 1 && (
        <p style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--muted)' }}>
          Complete more screenings for better predictions.
        </p>
      )}
    </div>
  );
}
