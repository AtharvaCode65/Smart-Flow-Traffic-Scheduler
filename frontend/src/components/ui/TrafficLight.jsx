export default function TrafficLight({ state = 'red', label }) {
  const colors = { red: 'bg-red-500', yellow: 'bg-amber-400', green: 'bg-signal shadow-[0_0_18px_#22c55e]' };
  return <div aria-label={`${label || 'Traffic'} signal: ${state}`} className="inline-flex items-center gap-2"><span className={`h-3 w-3 rounded-full ${colors[state]}`} /><span className="text-xs capitalize text-slate-300">{state}</span></div>;
}
