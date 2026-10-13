import { createContext, useCallback, useMemo, useState } from 'react';
import { getTrafficStatus } from '../services/trafficLaneService';
import { addVehicle } from '../services/vehicleService';
import { scheduleTrafficSignal } from '../services/trafficSignalService';
import { processSelectedLane, resetSimulation } from '../services/simulationService';
import { createActivity } from '../services/activityLogService';

export const TrafficContext = createContext(null);

export function TrafficProvider({ children }) {
  const [status, setStatus] = useState(null);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const addActivity = useCallback((message, type) => setActivities((items) => [createActivity(message, type), ...items].slice(0, 12)), []);

  const refreshStatus = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const nextStatus = await getTrafficStatus();
      setStatus(nextStatus);
    } catch (requestError) {
      setStatus(null);
      setSelectedSignal(null);
      setError(`C++ scheduler is unavailable: ${requestError.message}`);
    } finally { setLoading(false); }
  }, []);

  const runAction = useCallback(async (action, successMessage) => {
    setLoading(true); setError('');
    try {
      const result = await action();
      if (result.status) setStatus(result.status);
      addActivity(successMessage(result), 'success');
      return result;
    } catch (requestError) { setError(requestError.message); throw requestError; } finally { setLoading(false); }
  }, [addActivity]);

  const value = useMemo(() => ({ status, selectedSignal, activities, loading, error, refreshStatus,
    addVehicle: (vehicle) => runAction(() => addVehicle(vehicle), () => `Vehicle #${vehicle.id} added to the FIFO queue.`),
    schedule: async () => { const result = await runAction(scheduleTrafficSignal, (data) => `Lane ${data.selectedLane} selected by the C++ priority queue.`); setSelectedSignal(result); return result; },
    process: async () => { const result = await runAction(processSelectedLane, (data) => `${data.processedVehicles.length} vehicle(s) processed in FIFO order.`); setSelectedSignal(null); return result; },
    reset: async () => { const result = await runAction(resetSimulation, () => 'Simulation reset.'); setSelectedSignal(null); return result; },
  }), [status, selectedSignal, activities, loading, error, refreshStatus, runAction]);
  return <TrafficContext.Provider value={value}>{children}</TrafficContext.Provider>;
}
