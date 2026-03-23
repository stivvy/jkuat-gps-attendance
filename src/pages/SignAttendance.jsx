import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MapPin, CheckCircle, XCircle, Loader2, Navigation, Clock, AlertTriangle } from 'lucide-react';
import moment from 'moment';

const TIMETABLE = [
  { unit_code: "HPS 2413", unit_name: "Entrepreneurship Skills", venue: "HRD 205", day: "Monday", start_time: "07:00", end_time: "10:00", lecturer: "Mr. James Gacuiri", group: "Combined class", gps_lat: -1.0910, gps_lng: 37.0145 },
  { unit_code: "HPS 2409", unit_name: "Principles of Logistics Management", venue: "HRD 110", day: "Monday", start_time: "13:00", end_time: "16:00", lecturer: "Dr. Anthony Osoro", group: "Combined class", gps_lat: -1.0912, gps_lng: 37.0148 },
  { unit_code: "HPS 2410", unit_name: "E-Procurement Management", venue: "HRD 207", day: "Monday", start_time: "16:00", end_time: "19:00", lecturer: "Mr. Julius Ngatuny", group: "Combined class", gps_lat: -1.0908, gps_lng: 37.0142 },
  { unit_code: "HPS 2411", unit_name: "Management Accounting", venue: "HRD 109", day: "Tuesday", start_time: "10:00", end_time: "13:00", lecturer: "Ms. Druscilla Kemunto", group: "Combined class", gps_lat: -1.0915, gps_lng: 37.0150 },
  { unit_code: "HPS 2408", unit_name: "Employee & Industrial Relations", venue: "HRD 206", day: "Wednesday", start_time: "10:00", end_time: "13:00", lecturer: "Dr. Alice Simiyu", group: "GRP M", gps_lat: -1.0911, gps_lng: 37.0146 },
  { unit_code: "HPS 2412", unit_name: "Supply Chain Performance Management", venue: "HRD 109", day: "Wednesday", start_time: "10:00", end_time: "13:00", lecturer: "Dr. Elizabeth Wachiuri", group: "GRP N", gps_lat: -1.0915, gps_lng: 37.0150 },
  { unit_code: "HPS 2412", unit_name: "Supply Chain Performance Management", venue: "HRD 202", day: "Wednesday", start_time: "13:00", end_time: "16:00", lecturer: "Dr. Elizabeth Wachiuri", group: "GRP M", gps_lat: -1.0913, gps_lng: 37.0147 },
  { unit_code: "HPS 2408", unit_name: "Employee & Industrial Relations", venue: "HRD 204", day: "Wednesday", start_time: "16:00", end_time: "19:00", lecturer: "Dr. Alice Simiyu", group: "GRP N", gps_lat: -1.0909, gps_lng: 37.0143 },
];

const RADIUS_METERS = 100;

function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function SignAttendance() {
  const [user, setUser] = useState(null);
  const [gps, setGps] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [gettingGps, setGettingGps] = useState(false);
  const [signing, setSigning] = useState(false);
  const [result, setResult] = useState(null);
  const [existingLogs, setExistingLogs] = useState([]);
  const today = moment().format('dddd');
  const todayClasses = TIMETABLE.filter(c => c.day === today);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      base44.entities.AttendanceLog.filter({ student_email: u.email, date: moment().format('YYYY-MM-DD') }).then(setExistingLogs);
    });
  }, []);

  const getGPS = () => {
    setGettingGps(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      pos => { setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }); setGettingGps(false); },
      err => { setGpsError('Could not get your location. Please enable GPS and try again.'); setGettingGps(false); },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const signAttendance = async (cls) => {
    if (!gps) return;
    setSigning(true);
    setResult(null);
    const distance = calcDistance(gps.lat, gps.lng, cls.gps_lat, cls.gps_lng);
    const withinRange = distance <= RADIUS_METERS;

    // Find or create session
    let sessions = await base44.entities.AttendanceSession.filter({ classroom_id: cls.unit_code + '_' + cls.day + '_' + cls.venue, date: moment().format('YYYY-MM-DD') });
    let session = sessions[0];
    if (!session) {
      session = await base44.entities.AttendanceSession.create({
        classroom_id: cls.unit_code + '_' + cls.day + '_' + cls.venue,
        unit_name: cls.unit_name,
        unit_code: cls.unit_code,
        venue: cls.venue,
        date: moment().format('YYYY-MM-DD'),
        start_time: cls.start_time,
        end_time: cls.end_time,
        lecturer: cls.lecturer,
        status: 'open',
        total_signed: 0,
      });
    }

    if (!withinRange) {
      await base44.entities.AttendanceLog.create({
        session_id: session.id,
        classroom_id: cls.unit_code + '_' + cls.day + '_' + cls.venue,
        student_email: user.email,
        student_name: user.full_name,
        unit_name: cls.unit_name,
        unit_code: cls.unit_code,
        date: moment().format('YYYY-MM-DD'),
        signed_at: new Date().toISOString(),
        gps_lat: gps.lat,
        gps_lng: gps.lng,
        distance_from_class: Math.round(distance),
        status: 'rejected',
      });
      setResult({ success: false, message: `You are ${Math.round(distance)}m away from ${cls.venue}. You must be within ${RADIUS_METERS}m of the classroom.`, distance: Math.round(distance) });
      setSigning(false);
      return;
    }

    await base44.entities.AttendanceLog.create({
      session_id: session.id,
      classroom_id: cls.unit_code + '_' + cls.day + '_' + cls.venue,
      student_email: user.email,
      student_name: user.full_name,
      unit_name: cls.unit_name,
      unit_code: cls.unit_code,
      date: moment().format('YYYY-MM-DD'),
      signed_at: new Date().toISOString(),
      gps_lat: gps.lat,
      gps_lng: gps.lng,
      distance_from_class: Math.round(distance),
      status: 'present',
    });

    await base44.entities.AttendanceSession.update(session.id, { total_signed: (session.total_signed || 0) + 1 });
    setExistingLogs(prev => [...prev, { unit_code: cls.unit_code, date: moment().format('YYYY-MM-DD') }]);
    setResult({ success: true, message: `Attendance signed for ${cls.unit_name}! ✅`, distance: Math.round(distance) });
    setSigning(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white px-4 pt-12 pb-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2"><MapPin size={24} /> Sign Attendance</h1>
          <p className="text-green-200 text-sm mt-1">{moment().format('dddd, MMMM D YYYY')}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* GPS Step */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Navigation size={18} className="text-green-600" /> Step 1: Get Your Location</h2>
          {!gps ? (
            <button onClick={getGPS} disabled={gettingGps} className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
              {gettingGps ? <><Loader2 size={18} className="animate-spin" /> Getting GPS...</> : <><Navigation size={18} /> Enable & Get Location</>}
            </button>
          ) : (
            <div className="bg-green-50 rounded-xl p-3 flex items-start gap-3">
              <CheckCircle className="text-green-600 mt-0.5 shrink-0" size={18} />
              <div>
                <p className="text-sm font-semibold text-green-700">Location obtained ✓</p>
                <p className="text-xs text-gray-500 mt-0.5">Accuracy: ±{Math.round(gps.accuracy)}m • Lat: {gps.lat.toFixed(5)}, Lng: {gps.lng.toFixed(5)}</p>
                <button onClick={getGPS} className="text-xs text-green-600 underline mt-1">Refresh location</button>
              </div>
            </div>
          )}
          {gpsError && <div className="mt-3 bg-red-50 text-red-700 text-sm rounded-xl p-3 flex gap-2"><AlertTriangle size={16} className="shrink-0 mt-0.5" />{gpsError}</div>}
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-2xl p-4 mb-6 flex gap-3 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {result.success ? <CheckCircle className="text-green-600 shrink-0" size={20} /> : <XCircle className="text-red-500 shrink-0" size={20} />}
            <div>
              <p className={`font-semibold text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>{result.success ? 'Attendance Recorded!' : 'Outside Classroom Zone'}</p>
              <p className="text-sm mt-0.5 text-gray-600">{result.message}</p>
            </div>
          </div>
        )}

        {/* Today's Classes */}
        <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Clock size={18} className="text-green-600" /> Step 2: Select Your Class</h2>

        {todayClasses.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm">
            <p className="text-lg mb-1">🎉 No classes today!</p>
            <p className="text-sm">Thursday & Friday are for your research project.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayClasses.map((cls, i) => {
              const alreadySigned = existingLogs.some(l => l.unit_code === cls.unit_code);
              return (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-800">{cls.unit_name}</p>
                      <p className="text-xs text-gray-500">{cls.unit_code} • {cls.group}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{cls.venue}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><Clock size={12} />{cls.start_time} – {cls.end_time}</span>
                    <span>•</span>
                    <span>{cls.lecturer}</span>
                  </div>
                  {alreadySigned ? (
                    <div className="bg-green-50 rounded-xl p-3 flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="text-sm text-green-700 font-medium">Attendance already signed</span>
                    </div>
                  ) : (
                    <button onClick={() => signAttendance(cls)} disabled={!gps || signing} className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                      {signing ? <><Loader2 size={16} className="animate-spin" /> Signing...</> : <><CheckCircle size={16} /> Sign Attendance</>}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}