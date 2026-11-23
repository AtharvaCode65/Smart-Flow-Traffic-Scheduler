cmake_minimum_required(VERSION 3.16)
project(SmartFlowTrafficScheduler LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(smart_flow_server main.cpp TrafficScheduler.cpp)

# Winsock is included with Windows, so this API server has no external C++
# web-framework dependency. TrafficScheduler remains the scheduling engine.
target_link_libraries(smart_flow_server PRIVATE ws2_32)
