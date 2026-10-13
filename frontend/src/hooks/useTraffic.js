import { useContext } from 'react';
import { TrafficContext } from '../context/TrafficContext';
export const useTraffic = () => {
  const context = useContext(TrafficContext);
  if (!context) throw new Error('useTraffic must be used inside TrafficProvider.');
  return context;
};
