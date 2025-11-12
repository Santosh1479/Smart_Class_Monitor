import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#22c55e', '#f87171', '#facc15']; // Present-Green, Absent-Red, Holiday-Yellow

const Analytics = () => {
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAttendance() {
      try {
        const res = await fetch('http://localhost:3000/users/profile');
        const data = await res.json();

        if (res.ok && data.users?.length > 0) {
          const user = data.users[0];
          setAttendance(user.attendance || {});
        } else {
          setError(data.error || 'No attendance data found.');
        }
      } catch (_err) {
        setError(_err, 'Network or server error.');
      }
      setLoading(false);
    }
    fetchAttendance();
  }, []);

  if (loading) return <div>⏳ Loading attendance data...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const renderGraph = (subject, records) => {
    if (!records || records.length === 0) return null;

    let cumulative = 0;
    const graphData = records.slice(-30).map((status, index) => {
      if (status === 'p') cumulative += 1;
      else if (status === 'a') cumulative -= 1;
      else if (status === 'h') cumulative += 0.5;

      return {
        day: `Day ${index + 1}`,
        value: cumulative,
        status,
      };
    });

    return (
      <div key={subject} className="bg-white rounded-3xl shadow-md p-5 mb-6 border border-gray-100">
        <h2 className="text-xl font-bold mb-3">{subject}</h2>

        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={graphData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip
              formatter={(val, _, obj) => {
                const status = obj.payload.status;
                return status === 'p' ? 'Present' : status === 'a' ? 'Absent' : 'Holiday';
              }}
            />
            <Line
              type="monotone" // smooth slopy lines
              dataKey="value"
              stroke="#22c55e" // green line
              strokeWidth={3}
              dot={false} // no dots
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-blue-800 mb-8">📈 Attendance Trend</h1>

      {Object.keys(attendance).length === 0 ? (
        <div className="text-center text-gray-500">No subjects found for this student.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(attendance).map(([subject, records]) => renderGraph(subject, records))}
        </div>
      )}
    </div>
  );
};

export default Analytics;
