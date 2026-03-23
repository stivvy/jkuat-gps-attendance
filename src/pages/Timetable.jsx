import { Calendar, Clock, MapPin, User } from 'lucide-react';

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

const DAYS = ["Monday", "Tuesday", "Wednesday"];
const DAY_COLORS = { Monday: "border-green-400", Tuesday: "border-blue-400", Wednesday: "border-purple-400" };
const DAY_BG = { Monday: "bg-green-50", Tuesday: "bg-blue-50", Wednesday: "bg-purple-50" };
const DAY_TEXT = { Monday: "text-green-700", Tuesday: "text-blue-700", Wednesday: "text-purple-700" };

export default function Timetable() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-600 to-orange-400 text-white px-4 pt-12 pb-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Calendar size={24} /> Timetable</h1>
          <p className="text-orange-100 text-sm mt-1">BPCM 4.2 — February to May 2026</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          📌 <strong>Thursdays & Fridays</strong> are reserved for your research project.
        </div>

        {DAYS.map(day => (
          <div key={day}>
            <h2 className={`text-lg font-bold ${DAY_TEXT[day]} mb-3 flex items-center gap-2`}>
              <span className={`w-2 h-2 rounded-full ${DAY_COLORS[day].replace('border-', 'bg-')}`} />
              {day}
            </h2>
            <div className="space-y-3">
              {TIMETABLE.filter(c => c.day === day).map((cls, i) => (
                <div key={i} className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${DAY_COLORS[day]}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{cls.unit_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{cls.unit_code}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${DAY_BG[day]} ${DAY_TEXT[day]}`}>{cls.group}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock size={12} className="shrink-0" />
                      <span>{cls.start_time} – {cls.end_time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin size={12} className="shrink-0" />
                      <span>{cls.venue}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 col-span-2">
                      <User size={12} className="shrink-0" />
                      <span>{cls.lecturer}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}