#include "TrafficScheduler.h"
#include "crow.h"
#include <fstream>
#include <iostream>
#include <sstream>

TrafficScheduler scheduler;

std::string escapeJson(const std::string& text)
{
    std::string escaped;
    for (char character : text)
    {
        if (character == '"') escaped += "\\\"";
        else if (character == '\\') escaped += "\\\\";
        else escaped += character;
    }
    return escaped;
}

std::string vehicleToJson(const Vehicle& vehicle)
{
    return "{\"id\":" + std::to_string(vehicle.id) +
           ",\"type\":\"" + escapeJson(vehicle.type) +
           "\",\"arrivalTime\":" + std::to_string(vehicle.arrivalTime) +
           ",\"emergency\":" + (vehicle.emergency ? "true" : "false") + "}";
}

std::string statusToJson()
{
    std::vector<LaneInfo> lanes = scheduler.getStatus();
    std::ostringstream json;
    json << "{\"currentTime\":" << scheduler.getCurrentTime() << ",\"lanes\":[";

    for (size_t i = 0; i < lanes.size(); i++)
    {
        const LaneInfo& lane = lanes[i];
        if (i > 0) json << ',';
        json << "{\"laneNumber\":" << lane.laneNumber
             << ",\"queueLength\":" << lane.queueLength
             << ",\"waitingTime\":" << lane.waitingTime
             << ",\"hasEmergency\":" << (lane.hasEmergency ? "true" : "false")
             << ",\"emergencyBonus\":" << lane.emergencyBonus
             << ",\"priorityScore\":" << lane.priorityScore
             << ",\"vehicles\":[";
        for (size_t j = 0; j < lane.vehicles.size(); j++)
        {
            if (j > 0) json << ',';
            json << vehicleToJson(lane.vehicles[j]);
        }
        json << "]}";
    }
    json << "]}";
    return json.str();
}

crow::response jsonResponse(const std::string& body, int status = 200)
{
    crow::response response(status, body);
    response.set_header("Content-Type", "application/json");
    return response;
}

crow::response textFileResponse(const std::string& path, const std::string& contentType)
{
    std::ifstream file(path);
    if (!file)
    {
        return crow::response(404, "File not found. Start the server from the build folder.");
    }
    std::stringstream content;
    content << file.rdbuf();
    crow::response response(content.str());
    response.set_header("Content-Type", contentType);
    return response;
}

int main()
{
    crow::SimpleApp app;

    // The CMake file copies frontend/ beside the executable build folder.
    CROW_ROUTE(app, "/")([] { return textFileResponse("frontend/index.html", "text/html"); });
    CROW_ROUTE(app, "/style.css")([] { return textFileResponse("frontend/style.css", "text/css"); });
    CROW_ROUTE(app, "/script.js")([] { return textFileResponse("frontend/script.js", "application/javascript"); });

    CROW_ROUTE(app, "/api/status").methods(crow::HTTPMethod::GET)([] {
        return jsonResponse(statusToJson());
    });

    CROW_ROUTE(app, "/api/vehicles").methods(crow::HTTPMethod::Post)([](const crow::request& request) {
        auto input = crow::json::load(request.body);
        if (!input || !input.has("id") || !input.has("laneNumber") || !input.has("type") ||
            !input.has("arrivalTime") || !input.has("emergency"))
        {
            return jsonResponse("{\"error\":\"Send id, laneNumber, type, arrivalTime, and emergency.\"}", 400);
        }

        Vehicle vehicle{input["id"].i(), input["type"].s(), input["arrivalTime"].i(), input["emergency"].b()};
        std::string error;
        if (!scheduler.addVehicle(vehicle, input["laneNumber"].i(), error))
        {
            return jsonResponse("{\"error\":\"" + escapeJson(error) + "\"}", 400);
        }
        return jsonResponse("{\"message\":\"Vehicle added successfully.\",\"status\":" + statusToJson() + "}", 201);
    });

    CROW_ROUTE(app, "/api/schedule").methods(crow::HTTPMethod::Post)([] {
        ScheduleResult result = scheduler.schedule();
        if (!result.available)
        {
            return jsonResponse("{\"error\":\"" + result.message + "\"}", 400);
        }
        std::ostringstream json;
        json << "{\"message\":\"" << result.message << "\",\"selectedLane\":" <<
            std::to_string(result.laneNumber) + ",\"score\":" + std::to_string(result.score) +
            ",\"greenTime\":" + std::to_string(result.greenTime) + ",\"vehiclesToProcess\":" +
            std::to_string(result.vehiclesToProcess) + ",\"priorityQueue\":[";
        for (size_t i = 0; i < result.priorityQueue.size(); i++)
        {
            if (i > 0) json << ',';
            json << "{\"laneNumber\":" << result.priorityQueue[i].laneNumber
                 << ",\"score\":" << result.priorityQueue[i].score << '}';
        }
        json << "],\"status\":" << statusToJson() << '}';
        return jsonResponse(json.str());
    });

    CROW_ROUTE(app, "/api/process").methods(crow::HTTPMethod::Post)([] {
        std::string error;
        std::vector<Vehicle> processed = scheduler.processSelectedLane(error);
        if (!error.empty())
        {
            return jsonResponse("{\"error\":\"" + escapeJson(error) + "\"}", 400);
        }
        std::ostringstream json;
        json << "{\"message\":\"Vehicles processed in FIFO order.\",\"processedVehicles\":[";
        for (size_t i = 0; i < processed.size(); i++)
        {
            if (i > 0) json << ',';
            json << vehicleToJson(processed[i]);
        }
        json << "],\"status\":" << statusToJson() << '}';
        return jsonResponse(json.str());
    });

    CROW_ROUTE(app, "/api/reset").methods(crow::HTTPMethod::Post)([] {
        scheduler.reset();
        return jsonResponse("{\"message\":\"Simulation reset successfully.\",\"status\":" + statusToJson() + "}");
    });

    std::cout << "Smart Flow server: http://localhost:18080\n";
    // One scheduler object is shared by all requests, so a single-threaded
    // server keeps this beginner project simple and avoids concurrent queue access.
    app.port(18080).run();
}
