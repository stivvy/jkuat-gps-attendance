import { Link, useLocation } from 'react-router-dom';
import { Home, CheckCircle, TrendingUp, Calendar } from 'lucide-react';

const links = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/sign-attendance', icon: CheckCircle, label: 'Sign In' },
  { to: '/reports', icon: TrendingUp, label: 'Reports' },
  { to: '/timetable', icon: Calendar, label: 'Timetable' },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
      {links.map(({ to, icon: Icon, label }) => {
        const active = pathname === to;
        return (
          <Link key={to} to={to} className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${active ? 'text-green-600' : 'text-gray-400'}`}>
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}