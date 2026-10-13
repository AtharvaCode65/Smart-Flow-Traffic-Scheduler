# Smart Flow Traffic Scheduler

A beginner-friendly full-stack C++ project for a four-way traffic intersection. The web page uses HTML, CSS, and JavaScript; the server and traffic algorithm use C++ only.

## Architecture

```text
Browser dashboard (HTML, CSS, JavaScript)
        | fetch JSON requests
        v
C++ Crow HTTP server (main.cpp)
        |
        v
TrafficScheduler (four queue<Vehicle> lanes + priority_queue)
```

The browser sends vehicle JSON to `POST /api/vehicles`. Crow parses the JSON, `TrafficScheduler` pushes it to the rear of the selected lane, and the server returns JSON. The browser redraws the dashboard from that response.

## Queue and priority_queue logic

- `queue<Vehicle> lane[4]` stores Lane 1 through Lane 4.
- `push()` inserts at the rear, while `front()` and `pop()` remove only the oldest vehicle. This guarantees FIFO.
- Scores are `queue length * 2 + front vehicle waiting time + emergency bonus`.
- An emergency vehicle anywhere in the lane adds `20`.
- `priority_queue<LanePriority>` holds non-empty lane scores. `top()` gets the highest score without sorting. The custom `operator<` makes a lower lane number win a score tie.
- Green time is `3 seconds × queued vehicles`, limited to `15 seconds`. The process endpoint cannot process more vehicles than its selected lane contains.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/vehicles` | Adds one vehicle |
| GET | `/api/status` | Returns all queue and priority information |
| POST | `/api/schedule` | Uses `priority_queue` to select the green lane |
| POST | `/api/process` | Removes selected-lane front vehicles using FIFO |
| POST | `/api/reset` | Clears all four queues |

## Setup in VS Code on Windows

1. Install Visual Studio Build Tools with **Desktop development with C++**, CMake, Git, and VS Code's **C/C++** and **CMake Tools** extensions.
2. Install [vcpkg](https://github.com/microsoft/vcpkg), then run this once in PowerShell:

   ```powershell
   vcpkg install crow:x64-windows
   ```

3. Open the `backend` folder in a VS Code terminal and configure CMake. Replace `C:/vcpkg` with where you installed vcpkg:

   ```powershell
   cmake -S . -B build -DCMAKE_TOOLCHAIN_FILE=C:/vcpkg/scripts/buildsystems/vcpkg.cmake
   cmake --build build --config Debug
   ```

4. Run the server from the build directory:

   ```powershell
   .\build\Debug\smart_flow_server.exe
   ```

   If you use a non-Visual-Studio CMake generator, the executable can instead be `build\smart_flow_server.exe`.

5. Open `http://localhost:18080` in a browser. Do not double-click `index.html`; the C++ server supplies the page and API together.

Crow is the lightweight C++ HTTP framework. The CMake project links it as `Crow::Crow`; no Python, Flask, or Node.js backend is used.

## Demonstration checklist

1. Add cars to different lanes.
2. Add an ambulance with Emergency checked.
3. Click **Calculate Priority** and observe the scores.
4. Click **Run Signal**: the priority queue chooses the highest-score lane.
5. Click **Process Vehicles**: only front vehicles of the green lane leave in FIFO order.
6. Show the output log and updated lane cards.
7. Click **Reset Simulation** to clear queues.

## Complexity

- Queue `push`, `front`, and `pop`: `O(1)`.
- Checking a lane for emergency vehicles: `O(n)` for that lane.
- Adding the four lanes to the priority queue: `O(log 4)`, effectively constant because there are always four lanes.
- Tie-breaking in the comparator: `O(1)`.
