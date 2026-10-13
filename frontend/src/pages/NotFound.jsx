import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
export default function NotFound() { return <section className="mx-auto max-w-lg py-20 text-center"><p className="text-7xl font-bold text-blue">404</p><h1 className="mt-4 page-title">Page not found</h1><p className="mt-3 text-slate-400">This route does not exist in SmartFlow.</p><Link className="mt-7 inline-block" to="/"><Button>Return home</Button></Link></section>; }
