import { useEffect } from 'react';
import { Play, RefreshCw, RotateCcw, SkipForward } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import ErrorMessage from '../components/common/ErrorMessage';
import Loader from '../components/common/Loader';
import VehicleForm from '../components/common/VehicleForm';
import LaneCard from '../components/ui/LaneCard';
import PriorityQueuePanel from '../components/ui/PriorityQueuePanel';
import { useTraffic } from '../hooks/useTraffic';
import { getLaneName } from '../utils/traffic';

export default function Dashboard() {
  const traffic = useTraffic();
  useEffect(() => { traffic.refreshStatus(); }, [traffic.refreshStatus]);
  const handle = async (action, message) => { try { await action(); toast.success(message); } catch (error) { toast.error(error.message); } };
  if (traffic.loading && !traffic.status) return <Loader label="Loading C++ scheduler state…" />;
  const lanes = traffic.status?.lanes || [];
  const selected = traffic.selectedSignal;
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wider text-blue">C++ TrafficScheduler.cpp</p><h1 className="page-title">Priority queue scheduler</h1><p className="mt-1 text-sm text-slate-400">Lane queues and priority results are displayed only when returned by the C++ scheduler API.</p></div><ErrorMessage message={traffic.error} />{!traffic.status ? <section className="surface p-6"><h2 className="font-bold text-white">Scheduler unavailable</h2><p className="mt-2 text-sm text-slate-400">Start the C++ Crow server at <code>http://localhost:18080</code>, then refresh this page.</p><Button className="mt-4" onClick={() => handle(traffic.refreshStatus, 'Scheduler state loaded.')}><RefreshCw className="h-4 w-4" />Retry connection</Button></section> : <><section className="surface p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-bold text-white">Scheduler controls</h2><p className="mt-1 text-sm text-slate-400">Current scheduler time: {traffic.status.currentTime}s</p></div><div className="flex flex-wrap gap-2"><Button loading={traffic.loading} onClick={() => handle(traffic.schedule, 'C++ priority queue selected the next lane.')}><Play className="h-4 w-4" />Run scheduler</Button><Button variant="secondary" disabled={!selected || traffic.loading} onClick={() => handle(traffic.process, 'Selected lane processed in FIFO order.')}><SkipForward className="h-4 w-4" />Process selected lane</Button><Button variant="secondary" disabled={traffic.loading} onClick={() => handle(traffic.refreshStatus, 'Scheduler state refreshed.')}><RefreshCw className="h-4 w-4" />Refresh</Button><Button variant="danger" disabled={traffic.loading} onClick={() => handle(traffic.reset, 'Scheduler reset.')}><RotateCcw className="h-4 w-4" />Reset</Button></div></div>{selected && <div className="mt-4 rounded-lg border border-signal/50 bg-signal/10 p-3 text-sm text-green-100"><strong>Next selected lane: {getLaneName(selected.selectedLane)} (Lane {selected.selectedLane})</strong><br />Priority score: {selected.score}. Green time: {selected.greenTime}s. Vehicles to process: {selected.vehiclesToProcess}.</div>}</section><VehicleForm onSubmit={(vehicle) => handle(() => traffic.addVehicle(vehicle), `Vehicle #${vehicle.id} added to Lane ${vehicle.laneNumber}.`)} loading={traffic.loading} disabled={traffic.loading} /><PriorityQueuePanel priorityQueue={selected?.priorityQueue} lanes={lanes} selectedLane={selected?.selectedLane} /><section><h2 className="mb-3 text-xl font-bold text-white">Traffic lanes and FIFO vehicle queues</h2><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{lanes.map((lane) => <LaneCard key={lane.laneNumber} lane={lane} greenLane={selected?.selectedLane} />)}</div></section></>}</div>;
}
