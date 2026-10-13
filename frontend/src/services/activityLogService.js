import { format } from 'date-fns';
export const createActivity = (message, type = 'info') => ({ id: crypto.randomUUID(), message, type, timestamp: format(new Date(), 'HH:mm:ss') });
