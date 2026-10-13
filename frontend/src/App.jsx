import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import { TrafficProvider } from './context/TrafficContext';
export default function App() { return <TrafficProvider><AppRoutes /><Toaster position="top-right" toastOptions={{ style: { background: '#0d2747', color: '#fff' } }} /></TrafficProvider>; }
