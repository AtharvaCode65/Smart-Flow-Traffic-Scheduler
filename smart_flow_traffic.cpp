#include <iostream>
#include <queue>
#include <string>
#include <limits>

using namespace std;

// Stores information about one vehicle.
struct Vehicle
{
    int id;
    string type;
    int arrivalTime;
    bool emergency;
};

// Stores lane information for priority_queue.
struct LanePriority
{
    int laneNumber;
    int score;

    // Higher score gets higher priority.
    // If scores are equal, lower lane number gets priority.
    bool operator<(const LanePriority& other) const
    {
        if (score == other.score)
        {
            return laneNumber > other.laneNumber;
        }

        return score < other.score;
    }
};

// Reads a valid integer safely.
int getValidInt(string message)
{
    int value;

    while (true)
    {
        cout << message;
        cin >> value;

        if (!cin.fail())
        {
            return value;
        }

        cout << "Invalid input. Please enter a number.\n";

        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
    }
}

// Returns true if the lane contains an emergency vehicle.
bool hasEmergencyVehicle(queue<Vehicle> lane)
{
    while (!lane.empty())
    {
        if (lane.front().emergency)
        {
            return true;
        }

        lane.pop();
    }

    return false;
}

// Calculates waiting time of the first vehicle in a lane.
int getWaitingTime(queue<Vehicle> lane, int currentTime)
{
    if (lane.empty())
    {
        return 0;
    }

    int waitingTime = currentTime - lane.front().arrivalTime;

    if (waitingTime < 0)
    {
        waitingTime = 0;
    }

    return waitingTime;
}

// Calculates lane priority score.
int calculatePriorityScore(queue<Vehicle> lane, int currentTime)
{
    if (lane.empty())
    {
        return 0;
    }

    int queueLength = lane.size();
    int waitingTime = getWaitingTime(lane, currentTime);
    int emergencyBonus = 0;

    if (hasEmergencyVehicle(lane))
    {
        emergencyBonus = 20;
    }

    return (queueLength * 2) + waitingTime + emergencyBonus;
}

// Adds vehicles to the correct lane queue.
void addVehicles(queue<Vehicle> lane[], int& currentTime)
{
    int numberOfVehicles = getValidInt("\nEnter number of vehicles: ");

    while (numberOfVehicles <= 0)
    {
        cout << "Please enter a positive number.\n";
        numberOfVehicles = getValidInt("Enter number of vehicles: ");
    }

    for (int i = 0; i < numberOfVehicles; i++)
    {
        Vehicle vehicle;
        int laneNumber;
        char emergencyInput;

        cout << "\nVehicle " << i + 1 << " details\n";

        vehicle.id = getValidInt("Vehicle ID: ");

        laneNumber = getValidInt("Lane number (1-4): ");

        while (laneNumber < 1 || laneNumber > 4)
        {
            cout << "Invalid lane. Enter a lane number from 1 to 4.\n";
            laneNumber = getValidInt("Lane number (1-4): ");
        }

        cout << "Vehicle type (Car/Bus/Ambulance): ";
        cin >> vehicle.type;

        vehicle.arrivalTime = getValidInt("Arrival time: ");

        while (vehicle.arrivalTime < 0)
        {
            cout << "Arrival time cannot be negative.\n";
            vehicle.arrivalTime = getValidInt("Arrival time: ");
        }

        cout << "Emergency vehicle? (Y/N): ";
        cin >> emergencyInput;

        while (emergencyInput != 'Y' && emergencyInput != 'y' &&
               emergencyInput != 'N' && emergencyInput != 'n')
        {
            cout << "Invalid input. Enter Y or N: ";
            cin >> emergencyInput;
        }

        vehicle.emergency = (emergencyInput == 'Y' || emergencyInput == 'y');

        // push() adds the vehicle at the rear of the selected lane queue.
        lane[laneNumber - 1].push(vehicle);

        // Keeps simulation time at least as large as entered arrival times.
        if (vehicle.arrivalTime > currentTime)
        {
            currentTime = vehicle.arrivalTime;
        }

        cout << "Vehicle added successfully to Lane " << laneNumber << ".\n";
    }
}

// Displays all vehicles and their waiting times.
void displayQueueStatus(queue<Vehicle> lane[], int currentTime)
{
    cout << "\n====================================\n";
    cout << "CURRENT QUEUE STATUS\n";
    cout << "Simulation Time: " << currentTime << "\n";
    cout << "====================================\n";

    for (int i = 0; i < 4; i++)
    {
        cout << "\nLane " << i + 1 << " - Vehicles: " << lane[i].size() << "\n";

        if (lane[i].empty())
        {
            cout << "Queue is empty.\n";
            continue;
        }

        queue<Vehicle> temporaryQueue = lane[i];

        while (!temporaryQueue.empty())
        {
            Vehicle vehicle = temporaryQueue.front();

            int waitingTime = currentTime - vehicle.arrivalTime;

            if (waitingTime < 0)
            {
                waitingTime = 0;
            }

            cout << "ID: " << vehicle.id
                 << " | Type: " << vehicle.type
                 << " | Arrival Time: " << vehicle.arrivalTime
                 << " | Waiting Time: " << waitingTime
                 << " | Emergency: " << (vehicle.emergency ? "Yes" : "No")
                 << "\n";

            temporaryQueue.pop();
        }

        cout << "Emergency vehicle present: "
             << (hasEmergencyVehicle(lane[i]) ? "Yes" : "No") << "\n";
    }
}

// Calculates and displays priorities.
// Also returns a priority_queue containing non-empty lanes.
priority_queue<LanePriority> calculateLanePriorities(
    queue<Vehicle> lane[],
    int currentTime)
{
    priority_queue<LanePriority> lanePriorityQueue;

    cout << "\n====================================\n";
    cout << "LANE PRIORITIES\n";
    cout << "Formula = (Queue Length * 2) + Waiting Time + Emergency Bonus\n";
    cout << "Emergency Bonus = 20\n";
    cout << "====================================\n";

    for (int i = 0; i < 4; i++)
    {
        int queueLength = lane[i].size();
        int waitingTime = getWaitingTime(lane[i], currentTime);
        int emergencyBonus = hasEmergencyVehicle(lane[i]) ? 20 : 0;
        int score = calculatePriorityScore(lane[i], currentTime);

        cout << "Lane " << i + 1
             << " | Queue Length: " << queueLength
             << " | Waiting Time: " << waitingTime
             << " | Emergency Bonus: " << emergencyBonus
             << " | Priority Score: " << score << "\n";

        // Only non-empty lanes can receive a signal.
        if (!lane[i].empty())
        {
            LanePriority priorityInfo;
            priorityInfo.laneNumber = i + 1;
            priorityInfo.score = score;

            lanePriorityQueue.push(priorityInfo);
        }
    }

    return lanePriorityQueue;
}

// Processes vehicles from the front of the chosen lane.
void processVehicles(queue<Vehicle>& selectedLane, int vehiclesToProcess)
{
    int count = 0;

    while (!selectedLane.empty() && count < vehiclesToProcess)
    {
        Vehicle vehicle = selectedLane.front();

        cout << "Processed Vehicle -> "
             << "ID: " << vehicle.id
             << ", Type: " << vehicle.type
             << ", Emergency: " << (vehicle.emergency ? "Yes" : "No")
             << "\n";

        // pop() removes only the front vehicle, maintaining FIFO.
        selectedLane.pop();
        count++;
    }
}

// Selects a lane using priority_queue and runs the signal.
void runTrafficSignal(queue<Vehicle> lane[], int& currentTime)
{
    priority_queue<LanePriority> lanePriorityQueue =
        calculateLanePriorities(lane, currentTime);

    if (lanePriorityQueue.empty())
    {
        cout << "\nAll lanes are empty. No signal can be scheduled.\n";
        return;
    }

    // top() gives the lane with the highest priority score.
    LanePriority selected = lanePriorityQueue.top();

    int selectedLaneIndex = selected.laneNumber - 1;
    int vehiclesAvailable = lane[selectedLaneIndex].size();

    // Green time rule:
    // 3 seconds per vehicle, with a maximum of 15 seconds.
    int greenTime = vehiclesAvailable * 3;

    if (greenTime > 15)
    {
        greenTime = 15;
    }

    // One vehicle is processed every 3 seconds.
    int vehiclesToProcess = greenTime / 3;

    // Safety check: never process more than available vehicles.
    if (vehiclesToProcess > vehiclesAvailable)
    {
        vehiclesToProcess = vehiclesAvailable;
    }

    cout << "\n====================================\n";
    cout << "TRAFFIC SIGNAL SCHEDULING\n";
    cout << "====================================\n";
    cout << "Priority Queue Selected: Lane "
         << selected.laneNumber
         << " with score " << selected.score << "\n";

    cout << "GREEN SIGNAL: Lane " << selected.laneNumber << "\n";
    cout << "Green Signal Duration: " << greenTime << " seconds\n";
    cout << "Vehicles to Process: " << vehiclesToProcess << "\n\n";

    processVehicles(lane[selectedLaneIndex], vehiclesToProcess);

    currentTime += greenTime;

    cout << "\nSignal completed. Updated simulation time: "
         << currentTime << "\n";

    displayQueueStatus(lane, currentTime);
}

int main()
{
    queue<Vehicle> lane[4];
    int currentTime = 0;
    int choice;

    cout << "====================================\n";
    cout << "SMART FLOW TRAFFIC SCHEDULER\n";
    cout << "====================================\n";

    do
    {
        cout << "\n1. Add Vehicles\n";
        cout << "2. Display Queue Status\n";
        cout << "3. Calculate Lane Priorities\n";
        cout << "4. Run Traffic Signal\n";
        cout << "5. Exit\n";

        choice = getValidInt("Enter your choice: ");

        switch (choice)
        {
            case 1:
                addVehicles(lane, currentTime);
                break;

            case 2:
                displayQueueStatus(lane, currentTime);
                break;

            case 3:
                calculateLanePriorities(lane, currentTime);
                break;

            case 4:
                runTrafficSignal(lane, currentTime);
                break;

            case 5:
                cout << "\nThank you for using Smart Flow Traffic Scheduler.\n";
                break;

            default:
                cout << "Invalid choice. Please select 1 to 5.\n";
        }

    } while (choice != 5);

    return 0;
}