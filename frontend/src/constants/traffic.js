export const LANES = [
  { number: 1, name: 'North', direction: 'north' },
  { number: 2, name: 'East', direction: 'east' },
  { number: 3, name: 'South', direction: 'south' },
  { number: 4, name: 'West', direction: 'west' },
];

export const VEHICLE_TYPES = ['Car', 'Bus', 'Truck', 'Motorcycle', 'Ambulance', 'Fire Truck', 'Police Vehicle'];
export const SIGNAL_STATES = { RED: 'red', YELLOW: 'yellow', GREEN: 'green' };
export const NAVIGATION_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Dashboard', to: '/dashboard' },
];

export const API_TIMEOUT_MS = 5000;
