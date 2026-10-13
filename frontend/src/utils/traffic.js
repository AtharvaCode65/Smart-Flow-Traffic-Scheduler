import { LANES } from '../constants/traffic';

export const getLaneName = (laneNumber) => LANES.find((lane) => lane.number === laneNumber)?.name || `Lane ${laneNumber}`;

export function calculateMetrics(status) {
  const lanes = status?.lanes || [];
  const totalVehicles = lanes.reduce((total, lane) => total + lane.queueLength, 0);
  const averageWaitingTime = lanes.length
    ? Math.round(lanes.reduce((total, lane) => total + lane.waitingTime, 0) / lanes.length)
    : 0;
  return {
    totalVehicles,
    averageWaitingTime,
    emergencyVehicles: lanes.reduce((total, lane) => total + lane.vehicles.filter((vehicle) => vehicle.emergency).length, 0),
  };
}
