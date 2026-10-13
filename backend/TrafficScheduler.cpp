#include "TrafficScheduler.h"
#include <algorithm>
#include <queue>

// This object is stored in priority_queue. The object considered "largest"
// becomes top(). Equal scores are resolved by choosing the lower lane number.
struct LanePriority
{
    int laneNumber;
    int score;

    bool operator<(const LanePriority& other) const
    {
        if (score == other.score)
        {
            return laneNumber > other.laneNumber;
        }

        return score < other.score;
    }
};

TrafficScheduler::TrafficScheduler() : currentTime(0), selectedLane(-1)
{
}

bool TrafficScheduler::hasEmergencyVehicle(std::queue<Vehicle> laneCopy) const
{
    while (!laneCopy.empty())
    {
        if (laneCopy.front().emergency)
        {
            return true;
        }
        laneCopy.pop();
    }
    return false;
}

int TrafficScheduler::getWaitingTime(std::queue<Vehicle> laneCopy) const
{
    if (laneCopy.empty())
    {
        return 0;
    }

    // The front vehicle has waited the longest, so it represents lane waiting time.
    return std::max(0, currentTime - laneCopy.front().arrivalTime);
}

int TrafficScheduler::getPriorityScore(std::queue<Vehicle> laneCopy) const
{
    if (laneCopy.empty())
    {
        return 0;
    }

    int emergencyBonus = hasEmergencyVehicle(laneCopy) ? 20 : 0;
    return static_cast<int>(laneCopy.size()) * 2 + getWaitingTime(laneCopy) + emergencyBonus;
}

bool TrafficScheduler::addVehicle(const Vehicle& vehicle, int laneNumber, std::string& error)
{
    if (laneNumber < 1 || laneNumber > 4)
    {
        error = "Lane number must be between 1 and 4.";
        return false;
    }
    if (vehicle.id <= 0)
    {
        error = "Vehicle ID must be a positive number.";
        return false;
    }
    if (vehicle.type.empty())
    {
        error = "Vehicle type is required.";
        return false;
    }
    if (vehicle.arrivalTime < 0)
    {
        error = "Arrival time cannot be negative.";
        return false;
    }

    lane[laneNumber - 1].push(vehicle); // Adds at rear: FIFO rule.
    currentTime = std::max(currentTime, vehicle.arrivalTime);
    return true;
}

std::vector<LaneInfo> TrafficScheduler::getStatus() const
{
    std::vector<LaneInfo> status;

    for (int i = 0; i < 4; i++)
    {
        LaneInfo info;
        info.laneNumber = i + 1;
        info.queueLength = static_cast<int>(lane[i].size());
        info.waitingTime = getWaitingTime(lane[i]);
        info.hasEmergency = hasEmergencyVehicle(lane[i]);
        info.emergencyBonus = info.hasEmergency ? 20 : 0;
        info.priorityScore = getPriorityScore(lane[i]);

        std::queue<Vehicle> laneCopy = lane[i];
        while (!laneCopy.empty())
        {
            info.vehicles.push_back(laneCopy.front());
            laneCopy.pop();
        }
        status.push_back(info);
    }
    return status;
}

ScheduleResult TrafficScheduler::schedule()
{
    std::priority_queue<LanePriority> priorities;

    for (int i = 0; i < 4; i++)
    {
        if (!lane[i].empty())
        {
            priorities.push({i + 1, getPriorityScore(lane[i])});
        }
    }

    if (priorities.empty())
    {
        selectedLane = -1;
        return {false, 0, 0, 0, 0, "All lanes are empty.", {}};
    }

    // Popping a COPY shows the real priority_queue order without changing the
    // queue that is used to select the next green lane.
    std::vector<PriorityLane> priorityOrder;
    std::priority_queue<LanePriority> priorityCopy = priorities;
    while (!priorityCopy.empty())
    {
        priorityOrder.push_back({priorityCopy.top().laneNumber, priorityCopy.top().score});
        priorityCopy.pop();
    }

    LanePriority bestLane = priorities.top(); // No sorting: priority_queue selects it.
    selectedLane = bestLane.laneNumber - 1;
    int vehicleCount = static_cast<int>(lane[selectedLane].size());
    int greenTime = std::min(vehicleCount * 3, 15); // 3 seconds per vehicle, maximum 15.

    return {true, bestLane.laneNumber, bestLane.score, greenTime,
            std::min(vehicleCount, greenTime / 3), "Lane selected successfully.", priorityOrder};
}

std::vector<Vehicle> TrafficScheduler::processSelectedLane(std::string& error)
{
    std::vector<Vehicle> processed;

    if (selectedLane < 0 || selectedLane > 3)
    {
        error = "Run Signal first to select a lane.";
        return processed;
    }

    int greenTime = std::min(static_cast<int>(lane[selectedLane].size()) * 3, 15);
    int vehiclesToProcess = std::min(static_cast<int>(lane[selectedLane].size()), greenTime / 3);

    for (int i = 0; i < vehiclesToProcess; i++)
    {
        processed.push_back(lane[selectedLane].front()); // Reads front only.
        lane[selectedLane].pop();                         // Removes front only: FIFO.
    }

    currentTime += greenTime;
    selectedLane = -1;
    return processed;
}

void TrafficScheduler::reset()
{
    for (int i = 0; i < 4; i++)
    {
        std::queue<Vehicle> emptyLane;
        lane[i].swap(emptyLane);
    }
    currentTime = 0;
    selectedLane = -1;
}

int TrafficScheduler::getCurrentTime() const
{
    return currentTime;
}
