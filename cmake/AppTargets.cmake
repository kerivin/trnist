#-----------------------------------------------------------------------------
# EXECUTABLE SETUP
#-----------------------------------------------------------------------------

file(GLOB_RECURSE SOURCES "src/*.cpp")
file(GLOB_RECURSE HEADERS "include/*.h")

qt_add_executable(${PROJECT_NAME} WIN32
    main.cpp
    ${SOURCES}
)

target_include_directories(${PROJECT_NAME}
    PUBLIC 
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
        $<INSTALL_INTERFACE:include>
    PRIVATE
        ${Python3_INCLUDE_DIRS}
        ${pybind11_INCLUDE_DIRS}
)

target_link_libraries(${PROJECT_NAME} PRIVATE
    ${Python3_LIBRARIES}
    pybind11::embed
)

foreach(component IN LISTS QT_COMPONENTS)
    target_link_libraries(${PROJECT_NAME} PRIVATE "Qt6::${component}")
endforeach()

if(MSVC)
    target_compile_options(${PROJECT_NAME} PRIVATE /Zc:__cplusplus /W4 /WX)
else()
    target_compile_options(${PROJECT_NAME} PRIVATE -Wall -Wextra -Wpedantic -Werror -fPIC)
endif()

target_compile_options(${PROJECT_NAME} PRIVATE -fvisibility=hidden)

target_compile_definitions(${PROJECT_NAME} PRIVATE
    QT_NO_KEYWORDS
)

if(UNIX AND NOT APPLE)
    target_compile_definitions(${PROJECT_NAME} PRIVATE QT_QPA_PLATFORM=xcb)
endif()