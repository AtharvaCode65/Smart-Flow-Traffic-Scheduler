#include "TrafficScheduler.h"
#include <winsock2.h>
#include <ws2tcpip.h>
#include <cstdlib>
#include <iostream>
#include <sstream>
#include <string>

// HTTP wrapper only: priority logic remains in TrafficScheduler.cpp.
TrafficScheduler scheduler;

std::string escapeJson(const std::string& value) { std::string output; for (char c : value) { if (c == '"') output += "\\\""; else if (c == '\\') output += "\\\\"; else if (c == '\n') output += "\\n"; else output += c; } return output; }
std::string vehicleJson(const Vehicle& v) { return "{\"id\":" + std::to_string(v.id) + ",\"type\":\"" + escapeJson(v.type) + "\",\"arrivalTime\":" + std::to_string(v.arrivalTime) + ",\"emergency\":" + (v.emergency ? "true" : "false") + "}"; }

std::string statusJson()
{
    std::ostringstream json; std::vector<LaneInfo> lanes = scheduler.getStatus();
    json << "{\"currentTime\":" << scheduler.getCurrentTime() << ",\"lanes\":[";
    for (size_t i = 0; i < lanes.size(); ++i) { const LaneInfo& lane = lanes[i]; if (i) json << ','; json << "{\"laneNumber\":" << lane.laneNumber << ",\"queueLength\":" << lane.queueLength << ",\"waitingTime\":" << lane.waitingTime << ",\"hasEmergency\":" << (lane.hasEmergency ? "true" : "false") << ",\"emergencyBonus\":" << lane.emergencyBonus << ",\"priorityScore\":" << lane.priorityScore << ",\"vehicles\":["; for (size_t j = 0; j < lane.vehicles.size(); ++j) { if (j) json << ','; json << vehicleJson(lane.vehicles[j]); } json << "]}"; }
    json << "]}"; return json.str();
}

bool valueStart(const std::string& body, const std::string& key, size_t& start) { size_t keyAt = body.find("\"" + key + "\""); if (keyAt == std::string::npos) return false; size_t colon = body.find(':', keyAt); if (colon == std::string::npos) return false; start = body.find_first_not_of(" \t\r\n", colon + 1); return start != std::string::npos; }
bool jsonInt(const std::string& body, const std::string& key, int& number) { size_t start; if (!valueStart(body, key, start)) return false; char* end = 0; long result = std::strtol(body.c_str() + start, &end, 10); if (end == body.c_str() + start) return false; number = static_cast<int>(result); return true; }
bool jsonBool(const std::string& body, const std::string& key, bool& result) { size_t start; if (!valueStart(body, key, start)) return false; if (body.compare(start, 4, "true") == 0) { result = true; return true; } if (body.compare(start, 5, "false") == 0) { result = false; return true; } return false; }
bool jsonString(const std::string& body, const std::string& key, std::string& result) { size_t start; if (!valueStart(body, key, start) || body[start] != '"') return false; size_t end = body.find('"', start + 1); if (end == std::string::npos) return false; result = body.substr(start + 1, end - start - 1); return true; }

struct Result { int status; std::string body; };
Result route(const std::string& method, const std::string& path, const std::string& body)
{
    if (method == "GET" && path == "/api/status") return {200, statusJson()};
    if (method == "POST" && path == "/api/reset") { scheduler.reset(); return {200, "{\"message\":\"Simulation reset successfully.\",\"status\":" + statusJson() + "}"}; }
    if (method == "POST" && path == "/api/vehicles") { Vehicle vehicle; int lane; if (!jsonInt(body, "id", vehicle.id) || !jsonInt(body, "laneNumber", lane) || !jsonString(body, "type", vehicle.type) || !jsonInt(body, "arrivalTime", vehicle.arrivalTime) || !jsonBool(body, "emergency", vehicle.emergency)) return {400, "{\"error\":\"Send id, laneNumber, type, arrivalTime, and emergency.\"}"}; std::string error; if (!scheduler.addVehicle(vehicle, lane, error)) return {400, "{\"error\":\"" + escapeJson(error) + "\"}"}; return {201, "{\"message\":\"Vehicle added successfully.\",\"status\":" + statusJson() + "}"}; }
    if (method == "POST" && path == "/api/schedule") { ScheduleResult result = scheduler.schedule(); if (!result.available) return {400, "{\"error\":\"" + escapeJson(result.message) + "\"}"}; std::ostringstream json; json << "{\"message\":\"" << escapeJson(result.message) << "\",\"selectedLane\":" << result.laneNumber << ",\"score\":" << result.score << ",\"greenTime\":" << result.greenTime << ",\"vehiclesToProcess\":" << result.vehiclesToProcess << ",\"priorityQueue\":["; for (size_t i = 0; i < result.priorityQueue.size(); ++i) { if (i) json << ','; json << "{\"laneNumber\":" << result.priorityQueue[i].laneNumber << ",\"score\":" << result.priorityQueue[i].score << '}'; } json << "],\"status\":" << statusJson() << '}'; return {200, json.str()}; }
    if (method == "POST" && path == "/api/process") { std::string error; std::vector<Vehicle> processed = scheduler.processSelectedLane(error); if (!error.empty()) return {400, "{\"error\":\"" + escapeJson(error) + "\"}"}; std::ostringstream json; json << "{\"message\":\"Vehicles processed in FIFO order.\",\"processedVehicles\":["; for (size_t i = 0; i < processed.size(); ++i) { if (i) json << ','; json << vehicleJson(processed[i]); } json << "],\"status\":" << statusJson() << '}'; return {200, json.str()}; }
    return {404, "{\"error\":\"Route not found.\"}"};
}

std::string receiveAll(SOCKET client)
{
    std::string request; char buffer[4096]; size_t expected = 0;
    while (request.size() < 1024 * 1024) { int count = recv(client, buffer, sizeof(buffer), 0); if (count <= 0) break; request.append(buffer, count); size_t headerEnd = request.find("\r\n\r\n"); if (headerEnd != std::string::npos) { size_t lengthAt = request.find("Content-Length:"); if (lengthAt != std::string::npos) expected = static_cast<size_t>(std::strtoul(request.c_str() + lengthAt + 15, 0, 10)); if (request.size() >= headerEnd + 4 + expected) break; } }
    return request;
}
void reply(SOCKET client, const Result& result)
{
    const char* reason = result.status == 200 ? "OK" : result.status == 201 ? "Created" : result.status == 204 ? "No Content" : result.status == 400 ? "Bad Request" : "Not Found";
    std::ostringstream text; text << "HTTP/1.1 " << result.status << ' ' << reason << "\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET, POST, OPTIONS\r\nContent-Length: " << result.body.size() << "\r\nConnection: close\r\n\r\n" << result.body; std::string response = text.str(); send(client, response.c_str(), static_cast<int>(response.size()), 0);
}

int main()
{
    WSADATA data; if (WSAStartup(MAKEWORD(2, 2), &data) != 0) { std::cerr << "Winsock startup failed.\n"; return 1; }
    SOCKET server = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP); if (server == INVALID_SOCKET) { WSACleanup(); return 1; }
    sockaddr_in address = {}; address.sin_family = AF_INET; address.sin_addr.s_addr = htonl(INADDR_ANY); address.sin_port = htons(18080);
    if (bind(server, reinterpret_cast<sockaddr*>(&address), sizeof(address)) == SOCKET_ERROR || listen(server, SOMAXCONN) == SOCKET_ERROR) { std::cerr << "Cannot listen on port 18080.\n"; closesocket(server); WSACleanup(); return 1; }
    std::cout << "Smart Flow C++ scheduler API: http://localhost:18080\n";
    while (true) { SOCKET client = accept(server, 0, 0); if (client == INVALID_SOCKET) continue; std::string request = receiveAll(client); size_t lineEnd = request.find("\r\n"); std::istringstream line(request.substr(0, lineEnd)); std::string method, path; line >> method >> path; if (method == "OPTIONS") reply(client, {204, ""}); else { size_t bodyAt = request.find("\r\n\r\n"); reply(client, route(method, path, bodyAt == std::string::npos ? "" : request.substr(bodyAt + 4))); } closesocket(client); }
}
