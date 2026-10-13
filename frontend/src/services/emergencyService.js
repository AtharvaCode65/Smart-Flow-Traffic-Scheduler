// Emergency status is supplied as part of each Vehicle payload and status response.
export const getEmergencyVehicles = (status) => status.lanes.flatMap((lane) => lane.vehicles.filter((vehicle) => vehicle.emergency));
