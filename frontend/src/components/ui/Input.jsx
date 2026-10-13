import { forwardRef } from 'react';

const Input = forwardRef(function Input({ label, error, id, ...props }, ref) {
  return <label className="block text-sm font-medium text-slate-200" htmlFor={id}>{label}<input ref={ref} id={id} className="mt-1 w-full rounded-lg border border-slate-600 bg-navy px-3 py-2 text-white outline-none transition focus:border-blue" {...props} />{error && <span className="mt-1 block text-xs text-red-300">{error}</span>}</label>;
});

export default Input;
