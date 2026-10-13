import { LoaderCircle } from 'lucide-react';
export default function Button({ children, className = '', loading = false, variant = 'primary', disabled = false, ...props }) {
  const variants = { primary: 'bg-blue hover:bg-blue-400 text-white', secondary: 'bg-slate-700 hover:bg-slate-600 text-white', danger: 'bg-red-500 hover:bg-red-400 text-white', ghost: 'border border-slate-600 text-slate-200 hover:bg-slate-800' };
  return <button className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`} disabled={loading || disabled} {...props}>{loading && <LoaderCircle className="h-4 w-4 animate-spin" />}{children}</button>;
}
