#-----------------------------------------------------------------------------
# LibreOfficeKit
#-----------------------------------------------------------------------------

if(WIN32)
	set(LOK_DIR "${CMAKE_BINARY_DIR}/lo_sdk")
	set(LOK_LIBRARY "${LOK_DIR}/program/liblibreofficekit.dll")
	if(NOT EXISTS "${LOK_LIBRARY}")
		set(LOK_DOWNLOAD_URL "https://downloadarchive.documentfoundation.org/libreoffice/old/latest/win/x86_64/LibreOffice_25.2.4.1_Win_x86-64_sdk.msi")
		message(STATUS "Downloading LibreOffice SDK...")
		file(DOWNLOAD 
			${LOK_DOWNLOAD_URL}
			"${CMAKE_BINARY_DIR}/lo_sdk.msi"
			SHOW_PROGRESS
		)
		execute_process(COMMAND msiexec /a "${CMAKE_BINARY_DIR}/lo_sdk.msi" /qn TARGETDIR="${LOK_DIR}")
	endif()
	file(GLOB LO_LIBS "${LOK_DIR}/program/*.dll")
elseif(APPLE)
	execute_process(COMMAND ${BREW} install libreoffice --without-help --without-java --without-dbus --without-gui)
	execute_process(
		COMMAND ${BREW} --prefix libreoffice
		OUTPUT_VARIABLE LOK_PREFIX
		OUTPUT_STRIP_TRAILING_WHITESPACE
	)
	set(LOK_DIR "${LOK_PREFIX}/Contents/Resources")
	set(LOK_LIBRARY "${LOK_DIR}/program/liblibreofficekit.dylib")
	file(GLOB LO_LIBS "${LOK_DIR}/program/*.dylib")
else()
	execute_process(COMMAND sudo ${APT_GET} install -y libreofficekit-dev libreoffice-core libreoffice-common)
	find_library(LOK_LIBRARY
		NAMES
			libreofficekit.so
			liblibreofficekit.so
			liblibreofficekitgtk.so
		PATHS
			"/usr/lib/libreoffice"
			"/usr/lib/libreoffice/program"
			"/usr/lib/x86_64-linux-gnu"
			"/usr/lib/x86_64-linux-gnu/libreoffice"
			"/usr/lib/x86_64-linux-gnu/libreoffice/program"
	)
	get_filename_component(LOK_DIR "${LOK_LIBRARY}" DIRECTORY)
	file(GLOB LO_LIBS
        "/usr/lib/libreoffice/program/*.so*"
        "/usr/lib/x86_64-linux-gnu/libreoffice/program/*.so*"
    )
endif()

find_path(LOK_INCLUDE_DIR
	NAMES LibreOfficeKit/LibreOfficeKit.h
	PATHS
		"${LOK_DIR}/sdk/include"
		"/usr/include"
		"/usr/local/include"
)

message(STATUS "LibreOfficeKit directory: ${LOK_DIR}")
message(STATUS "LibreOfficeKit library: ${LOK_LIBRARY}")
message(STATUS "LibreOfficeKit include: ${LOK_INCLUDE_DIR}")
if(NOT LOK_INCLUDE_DIR OR NOT LOK_DIR)
	message(FATAL_ERROR "LibreOfficeKit not found! Install it first.")
endif()