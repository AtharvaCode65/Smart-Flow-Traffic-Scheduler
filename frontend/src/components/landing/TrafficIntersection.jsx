import { Ambulance, CarFront } from 'lucide-react';

function Signal({ active }) { return <span className={`inline-block h-3 w-3 rounded-full ${active ? 'bg-signal shadow-[0_0_14px_#22c55e]' : 'bg-red-500'}`} />; }

export default function TrafficIntersection({ lanes, greenLane }) {
  return <div className="relative mx-auto aspect-square w-full max-w-[530px] overflow-hidden rounded-[2rem] border border-slate-700 bg-[#071426] p-5 shadow-glow" aria-label="Four-way traffic intersection visualization">
    <div className="absolute left-1/2 top-0 h-full w-[26%] -translate-x-1/2 bg-slate-700/80" /><div className="absolute left-0 top-1/2 h-[26%] w-full -translate-y-1/2 bg-slate-700/80" />
    <div className="absolute left-1/2 top-1/2 z-10 h-[29%] w-[29%] -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-dashed border-slate-500 bg-slate-800/80" />
    <div className="absolute left-1/2 top-1/2 z-20 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-blue/40 bg-navy text-center text-[10px] font-bold text-blue">SMART<br />FLOW</div>
    {lanes.map((lane) => {
      const active = lane.id === greenLane;
      const positions = { 1: 'left-1/2 top-3 -translate-x-1/2', 2: 'right-3 top-1/2 -translate-y-1/2', 3: 'bottom-3 left-1/2 -translate-x-1/2', 4: 'left-3 top-1/2 -translate-y-1/2' };
      return <div key={lane.id} className={`absolute z-30 w-28 rounded-xl border p-2 backdrop-blur ${positions[lane.id]} ${active ? 'border-signal bg-signal/15' : 'border-slate-600 bg-navy/85'}`}><div className="flex items-center justify-between text-xs"><span className="font-bold text-white">{lane.name}</span><Signal active={active} /></div><p className={`mt-1 text-xs font-medium ${active ? 'text-green-300' : 'text-red-300'}`}>{active ? 'GREEN · moving' : 'RED · waiting'}</p><div className="mt-2 flex items-center gap-1 text-slate-200"><CarFront className={active ? 'h-4 w-4 animate-pulse text-blue' : 'h-4 w-4'} /><span className="text-sm font-bold">{lane.queue}</span><span className="text-[10px] text-slate-400">queued</span></div>{lane.emergency > 0 && <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-300"><Ambulance className="h-3 w-3" />{lane.emergency} emergency</p>}</div>;
    })}
  </div>;
}
