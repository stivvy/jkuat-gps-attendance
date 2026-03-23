import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, TrendingUp, MapPin, Calendar, AlertCircle } from 'lucide-react';
import moment from 'moment';

const TIMETABLE = [
  { unit_code: "HPS 2413", unit_name: "Entrepreneurship Skills", venue: "HRD 205", day: "Monday", start_time: "07:00", end_time: "10:00", lecturer: "Mr. James Gacuiri", group: "Combined class" },
  { unit_code: "HPS 2409", unit_name: "Principles of Logistics Management", venue: "HRD 110", day: "Monday", start_time: "13:00", end_time: "16:00", lecturer: "Dr. Anthony Osoro", group: "Combined class" },
  { unit_code: "HPS 2410", unit_name: "E-Procurement Management", venue: "HRD 207", day: "Monday", start_time: "16:00", end_time: "19:00", lecturer: "Mr. Julius Ngatuny", group: "Combined class" },
  { unit_code: "HPS 2411", unit_name: "Management Accounting", venue: "HRD 109", day: "Tuesday", start_time: "10:00", end_time: "13:00", lecturer: "Ms. Druscilla Kemunto", group: "Combined class" },
  { unit_code: "HPS 2408", unit_name: "Employee & Industrial Relations", venue: "HRD 206", day: "Wednesday", start_time: "10:00", end_time: "13:00", lecturer: "Dr. Alice Simiyu", group: "GRP M" },
  { unit_code: "HPS 2412", unit_name: "Supply Chain Performance Management", venue: "HRD 109", day: "Wednesday", start_time: "10:00", end_time: "13:00", lecturer: "Dr. Elizabeth Wachiuri", group: "GRP N" },
  { unit_code: "HPS 2412", unit_name: "Supply Chain Performance Management", venue: "HRD 202", day: "Wednesday", start_time: "13:00", end_time: "16:00", lecturer: "Dr. Elizabeth Wachiuri", group: "GRP M" },
  { unit_code: "HPS 2408", unit_name: "Employee & Industrial Relations", venue: "HRD 204", day: "Wednesday", start_time: "16:00", end_time: "19:00", lecturer: "Dr. Alice Simiyu", group: "GRP N" },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const today = moment().format('dddd');
  const todayClasses = TIMETABLE.filter(c => c.day === today);

  useEffect(() => {
    base44.auth.me().then(setUser);
    base44.entities.AttendanceLog.list('-signed_at', 100).then(setLogs);
    base44.entities.AttendanceSession.list('-created_date', 50).then(setSessions);
  }, []);

  const isAdmin = user?.role === 'admin';
  const myLogs = isAdmin ? logs : logs.filter(l => l.student_email === user?.email);
  const totalClasses = TIMETABLE.length;
  const attendedUnits = [...new Set(myLogs.map(l => l.unit_code))].length;
  const attendanceRate = totalClasses > 0 ? Math.round((myLogs.length / Math.max(sessions.length, 1)) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white px-4 pt-12 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <img src="https://upload.wikimedia.org/wikipedia/en/thumb/7/73/Jkuat_logo.png/200px-Jkuat_logo.png" alt="JKUAT" className="h-10 w-10 rounded-full bg-white p-0.5" onError={e => e.target.style.display='none'} />
            <div>
              <p className="text-green-200 text-sm">JKUAT – BPCM 4.2</p>
              <h1 className="text-xl font-bold">Hello, {user?.full_name?.split(' ')[0] || 'Student'} 👋</h1>
            </div>
          </div>
          <p className="text-green-200 text-sm mt-1">{moment().format('dddd, MMMM D YYYY')}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-green-700">{myLogs.length}</p>
            <p className="text-xs text-gray-500 mt-1">Classes Attended</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-blue-600">{totalClasses}</p>
            <p className="text-xs text-gray-500 mt-1">Total Classes</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-orange-500">{isAdmin ? sessions.length : attendedUnits}</p>
            <p className="text-xs text-gray-500 mt-1">{isAdmin ? 'Sessions' : 'Units'}</p>
          </div>
        </div>

        {/* Attendance requirement notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex gap-3">
          <AlertCircle className="text-amber-500 mt-0.5 shrink-0" size={18} />
          <p className="text-sm text-amber-800">You need to attend <strong>2/3 of classes</strong> to sit for exams. Stay on track!</p>
        </div>

        {/* Today's Classes */}
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Calendar size={18} className="text-green-600" /> Today's Classes
        </h2>

        {todayClasses.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-gray-400 shadow-sm mb-6">
            <BookOpen size={32} className="mx-auto mb-2 opacity-40" />
            <p>No classes today — use the time wisely! 📚</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {todayClasses.map((cls, i) => {
              const alreadySigned = myLogs.some(l => l.unit_code === cls.unit_code && l.date === moment().format('YYYY-MM-DD'));
              return (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-green-500">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{cls.unit_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{cls.unit_code} • {cls.lecturer}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-gray-500"><Clock size={12} />{cls.start_time}–{cls.end_time}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-500"><MapPin size={12} />{cls.venue}</span>
                      </div>
                    </div>
                    {alreadySigned ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full"><CheckCircle size={12} />Signed</span>
                    ) : (
                      <Link to="/sign-attendance" className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-full font-medium">Sign In</Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <TrendingUp size={18} className="text-green-600" /> Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Link to="/sign-attendance" className="bg-green-600 text-white rounded-2xl p-5 flex flex-col items-center gap-2 shadow-sm">
            <CheckCircle size={28} />
            <span className="font-semibold text-sm">Sign Attendance</span>
          </Link>
          <Link to="/reports" className="bg-white text-gray-700 rounded-2xl p-5 flex flex-col items-center gap-2 shadow-sm border border-gray-100">
            <TrendingUp size={28} className="text-blue-500" />
            <span className="font-semibold text-sm">View Reports</span>
          </Link>
          <Link to="/classes" className="bg-white text-gray-700 rounded-2xl p-5 flex flex-col items-center gap-2 shadow-sm border border-gray-100">
            <BookOpen size={28} className="text-purple-500" />
            <span className="font-semibold text-sm">All Classes</span>
          </Link>
          <Link to="/timetable" className="bg-white text-gray-700 rounded-2xl p-5 flex flex-col items-center gap-2 shadow-sm border border-gray-100">
            <Calendar size={28} className="text-orange-500" />
            <span className="font-semibold text-sm">Timetable</span>
          </Link>
        </div>
      </div>
    </div>
  );
}