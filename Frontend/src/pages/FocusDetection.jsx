import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#22c55e', '#f87171', '#facc15']; // Present-Green, Absent-Red, Holiday-Yellow

const FocusDetection = () => {
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

    const presentCount = records.filter((r) => r === 'p').length;
    const absentCount = records.filter((r) => r === 'a').length;
    const holidayCount = records.filter((r) => r === 'h').length;
    const total = presentCount + absentCount + holidayCount;
    const percentage = total > 0 ? ((presentCount / total) * 100).toFixed(1) : 0;

    const data = [
      { name: 'Present', value: presentCount },
      { name: 'Absent', value: absentCount },
      { name: 'Holiday', value: holidayCount },
    ];

    return (
      <div
        key={subject}
        className="bg-white rounded-3xl shadow-md p-5 mb-6 border border-gray-100 flex flex-col items-center"
      >
        <h2 className="text-xl font-bold mb-4">{subject}</h2>
        <div style={{ position: 'relative', width: 200, height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                startAngle={90}
                endAngle={-270} // to make it clockwise
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} separator=": " />
            </PieChart>
          </ResponsiveContainer>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#22c55e',
            }}
          >
            {percentage}%
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-blue-800 mb-8">🎯 Attendance Overview</h1>

      {Object.keys(attendance).length === 0 ? (
        <div className="text-center text-gray-500">No subjects found for this student.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 justify-items-center">
          {Object.entries(attendance).map(([subject, records]) => renderGraph(subject, records))}
        </div>
      )}
    </div>
  );
};

export default FocusDetection;
