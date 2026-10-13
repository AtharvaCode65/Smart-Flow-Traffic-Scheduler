import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
export default function DashboardLayout() { return <div className="min-h-screen"><Navbar /><main className="mx-auto max-w-7xl px-5 py-8"><Outlet /></main><Footer /></div>; }
