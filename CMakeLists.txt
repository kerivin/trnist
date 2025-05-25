cmake_minimum_required(VERSION 3.21)
project(trnist LANGUAGES CXX)

set(CMAKE_INSTALL_PREFIX "${CMAKE_BINARY_DIR}/bin" CACHE PATH "Installation directory")
message(STATUS "Installation folder: ${CMAKE_INSTALL_PREFIX}")

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
enable_language(C)

include(cmake/PackageManagers.cmake)
include(cmake/QtSetup.cmake)
include(cmake/PythonSetup.cmake)
include(cmake/AppTargets.cmake)
include(cmake/Installation.cmake)