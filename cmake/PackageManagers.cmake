#-----------------------------------------------------------------------------
# Package managers
#-----------------------------------------------------------------------------

set(MISSING_MESSAGE "is required for dependency installation")

if(WIN32)
    # Windows - choco
    find_program(CHOCO choco.exe)
    if(NOT CHOCO)
        message(STATUS "Installing Chocolatey...")
        file(DOWNLOAD https://chocolatey.org/install.ps1 "${CMAKE_BINARY_DIR}/install-choco.ps1" STATUS download_status)
        list(GET download_status 0 error_code)
        execute_process(
            COMMAND powershell -ExecutionPolicy Bypass -Command 
                "[System.Environment]::SetEnvironmentVariable('Path', [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User'), 'Process'); & '${CMAKE_BINARY_DIR}/install-choco.ps1'"
        )
        set(ENV{PATH} "$ENV{ALLUSERSPROFILE}\\chocolatey\\bin;$ENV{PATH}")
        unset(CHOCO CACHE)
        find_program(CHOCO choco.exe REQUIRED)
    endif()
elseif(APPLE)
    # macOS - brew
    find_program(BREW brew)
    if(NOT BREW)
        message(FATAL_ERROR "brew ${MISSING_MESSAGE}")
    endif()
else()
    # Linux - apt-get
    find_program(APT_GET apt-get)
    if(NOT APT_GET)
        message(FATAL_ERROR "apt-get ${MISSING_MESSAGE}")
    endif()
    execute_process(COMMAND sudo ${APT_GET} update)
endif()