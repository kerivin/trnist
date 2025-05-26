#-----------------------------------------------------------------------------
# Qt6
#-----------------------------------------------------------------------------

set(QT_COMPONENTS Core Gui Widgets Sql Qml Network)

if(WIN32)
	execute_process(COMMAND ${CHOCO} install qt6-base-dev -y --version 6.4.2 --no-progress --params="/InstallationPath C:/Qt")
	set(QT_PATHS 
		"C:/Qt/6.4.2/msvc2019_64/lib/cmake/Qt6"
		"C:/Qt/6.4.2/msvc2019_64"
		"C:/Qt/6.4.2/msvc2022_64/lib/cmake/Qt6"
		"C:/Qt/6.4.2/msvc2022_64"
		"C:/Qt/6.4.2/mingw_64/lib/cmake/Qt6"
		"C:/Qt/6.4.2/mingw_64"
		"$ENV{QT_DIR}"
		"$ENV{QTDIR}"
	)
	find_path(QT_DIR 
		NAMES Qt6Config.cmake
		PATHS ${QT_PATHS}
		REQUIRED
	)
elseif(APPLE)
	execute_process(COMMAND ${BREW} install qt@6)
	execute_process(
		COMMAND ${BREW} --prefix qt@6
		OUTPUT_VARIABLE QT_PREFIX
		OUTPUT_STRIP_TRAILING_WHITESPACE
	)
	set(QT_DIR "${QT_PREFIX}/lib/cmake/Qt6")
else()
	execute_process(COMMAND sudo ${APT_GET} install -y libgl1-mesa-dev qt6-base-dev qt6-declarative-dev)
	set(QT_DIR "/usr/lib/x86_64-linux-gnu/cmake/Qt6")
endif()

list(APPEND CMAKE_PREFIX_PATH ${QT_DIR})
set(CMAKE_AUTOMOC ON)
find_package(Qt6 REQUIRED COMPONENTS ${QT_COMPONENTS})