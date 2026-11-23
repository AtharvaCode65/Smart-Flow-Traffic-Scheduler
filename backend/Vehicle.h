#ifndef VEHICLE_H
#define VEHICLE_H

#include <string>

// One vehicle waiting at the intersection.
struct Vehicle
{
    int id;
    std::string type;
    int arrivalTime;
    bool emergency;
};

#endif
