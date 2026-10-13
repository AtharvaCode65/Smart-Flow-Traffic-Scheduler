import { Menu, TrafficCone, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const links = [['Home', 'top'], ['Features', 'features'], ['How It Works', 'how-it-works']];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const goTo = (id) => {
    setOpen(false);
    if (location.pathname !== '/') { navigate('/'); window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 60); }
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  return <header className="sticky top-0 z-50 border-b border-slate-800 bg-navy/95 backdrop-blur"><nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 font-bold text-white"><TrafficCone className="text-blue" />SmartFlow</Link><button className="sm:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button><div className={`${open ? 'absolute left-0 right-0 top-[65px] flex' : 'hidden'} flex-col gap-3 border-b border-slate-800 bg-navy p-5 sm:static sm:flex sm:flex-row sm:items-center sm:border-0 sm:bg-transparent sm:p-0`}>{links.map(([label, id]) => <button key={id} onClick={() => goTo(id)} className="text-left text-sm text-slate-300 hover:text-white">{label}</button>)}<Link to="/dashboard" className="rounded-lg bg-blue px-3 py-2 text-center text-sm font-bold text-white hover:bg-blue-400">Dashboard</Link></div></nav></header>;
}
