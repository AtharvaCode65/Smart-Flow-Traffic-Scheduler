# SmartFlow Express + MongoDB API

This Node/Express service stores SmartFlow lane, vehicle, and signal-log records in MongoDB. It does not replace or run the C++ `queue<Vehicle>` and `priority_queue` scheduler in this folder.

## Install and run (Windows PowerShell)

Install Node.js LTS first, then run:

```powershell
cd "C:\Users\DELL\OneDrive\Desktop\Traffic Scheduler\backend"
npm install
Copy-Item .env.example .env
npm run dev
```

Set `MONGODB_URI` in `.env` before starting. The server only starts after a MongoDB connection succeeds.

## MongoDB setup

Local MongoDB: set `MONGODB_URI=mongodb://127.0.0.1:27017/smartflow` and make sure the MongoDB service is running.

MongoDB Atlas: create a database user, add your current IP address under **Network Access**, then paste the Atlas connection string into `MONGODB_URI`. URL-encode special characters in the password.

## API examples

```powershell
Invoke-RestMethod http://localhost:5000/api/health
Invoke-RestMethod http://localhost:5000/api/db-status
Invoke-RestMethod -Method Post http://localhost:5000/api/vehicles -ContentType 'application/json' -Body '{"laneNumber":2,"vehicleType":"Ambulance","arrivalTime":12,"emergency":true}'
Invoke-RestMethod http://localhost:5000/api/vehicles
Invoke-RestMethod http://localhost:5000/api/lanes
Invoke-RestMethod http://localhost:5000/api/signals/logs
```

Expected create-vehicle response:

```json
{
  "message": "Vehicle record created.",
  "vehicle": {
    "laneNumber": 2,
    "direction": "East",
    "vehicleType": "Ambulance",
    "arrivalTime": 12,
    "emergency": true
  }
}
```

## Postman

Create a collection with base URL `http://localhost:5000`. Add `GET /api/health`, then create a `POST /api/vehicles` request using **Body → raw → JSON** and the JSON above. A `201 Created` response confirms MongoDB saved the record.

## React Axios configuration

Set this in `frontend/.env` for the Express data API:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Example:

```js
axios.get(`${import.meta.env.VITE_API_BASE_URL}/health`);
```

The current React dashboard was built for the C++ scheduler response shape (`/status`, `/schedule`, `/process`). Switching its one API base variable to this Express server will work for `/vehicles` but not make scheduler screens functional; an adapter or real C++ ↔ Express integration is still required.

## C++ scheduler integration (pending)

An integration process can have Express send newly created vehicles to the C++ HTTP API at `http://localhost:18080/api/vehicles`, and have the C++ scheduler post selected-lane results back to Express for `SignalLog` storage. This bridge is not implemented here, so neither service falsely claims it controls the other.

## Troubleshooting

- `Unable to start API`: check `MONGODB_URI`, database service/Atlas network access, then retry.
- CORS error: ensure `FRONTEND_URL` exactly matches Vite’s origin, normally `http://localhost:5173`.
- `npm` not found: install Node.js LTS, reopen VS Code, and run `node --version`.
