import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function ForecastChart({ data, type = 'revenue', title }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 text-center">
        <p className="text-slate-400">No forecast data available</p>
      </div>
    );
  }

  const chartData = Array.isArray(data) ? data : [data];

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title || 'Forecast'}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {type === 'revenue' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="predicted_revenue"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={{ fill: '#06b6d4' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Legend />
            <Bar dataKey="value" fill="#06b6d4" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
