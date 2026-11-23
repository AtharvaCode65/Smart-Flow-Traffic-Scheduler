#ifndef TRAFFIC_SCHEDULER_H
#define TRAFFIC_SCHEDULER_H

#include "Vehicle.h"
#include <queue>
#include <string>
#include <vector>

struct LaneInfo
{
    int laneNumber;
    int queueLength;
    int waitingTime;
    bool hasEmergency;
    int emergencyBonus;
    int priorityScore;
    std::vector<Vehicle> vehicles;
};

// A lane candidate as it appears in the C++ priority_queue.
struct PriorityLane
{
    int laneNumber;
    int score;
};

struct ScheduleResult
{
    bool available;
    int laneNumber;
    int score;
    int greenTime;
    int vehiclesToProcess;
    std::string message;
    std::vector<PriorityLane> priorityQueue;
};

// Stores four FIFO lanes and contains the traffic-signal rules.
class TrafficScheduler
{
private:
    std::queue<Vehicle> lane[4];
    int currentTime;
    int selectedLane;

    bool hasEmergencyVehicle(std::queue<Vehicle> laneCopy) const;
    int getWaitingTime(std::queue<Vehicle> laneCopy) const;
    int getPriorityScore(std::queue<Vehicle> laneCopy) const;

public:
    TrafficScheduler();

    bool addVehicle(const Vehicle& vehicle, int laneNumber, std::string& error);
    std::vector<LaneInfo> getStatus() const;
    ScheduleResult schedule();
    std::vector<Vehicle> processSelectedLane(std::string& error);
    void reset();
    int getCurrentTime() const;
};

#endif
