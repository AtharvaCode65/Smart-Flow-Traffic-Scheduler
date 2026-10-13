cmake_minimum_required(VERSION 3.16)
project(SmartFlowTrafficScheduler LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Install Crow first with vcpkg, then configure using the vcpkg toolchain.
find_package(Crow CONFIG REQUIRED)

add_executable(smart_flow_server
    main.cpp
    TrafficScheduler.cpp
)

target_link_libraries(smart_flow_server PRIVATE Crow::Crow)

# Make the dashboard available relative to the build directory at run time.
file(COPY ${CMAKE_CURRENT_SOURCE_DIR}/../frontend DESTINATION ${CMAKE_CURRENT_BINARY_DIR})
