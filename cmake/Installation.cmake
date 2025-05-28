#-----------------------------------------------------------------------------
# INSTALL
#-----------------------------------------------------------------------------

set(PYTHON_MODULES_DIR "py_modules")

install(TARGETS ${PROJECT_NAME}
		RUNTIME DESTINATION .
		BUNDLE DESTINATION .
		LIBRARY DESTINATION .
		ARCHIVE DESTINATION .)

install(
	DIRECTORY
		${VENV_SITE_PACKAGES}/
	DESTINATION
		${PYTHON_MODULES_DIR}
	PATTERN "__pycache__" EXCLUDE
	PATTERN "*.pyc" EXCLUDE
	PATTERN "*.dist-info" EXCLUDE
	PATTERN "*.egg-info" EXCLUDE
)

get_target_property(Qt6_core_location Qt6::Core IMPORTED_LOCATION)
if(Qt6_core_location)
	get_filename_component(QT_BIN_DIR "${Qt6_core_location}" DIRECTORY)
	
	if(WIN32)
		set(PLATFORM_LIB qwindows.dll)
	elseif(APPLE)
		set(PLATFORM_LIB libqcocoa.dylib)
	else()
		set(PLATFORM_LIB libqxcb.so)
	endif()

	find_path(QT_PLATFORMS_DIR
		NAMES ${PLATFORM_LIB}
		PATHS "${QT_BIN_DIR}/../plugins/platforms" "/usr/lib/qt6/plugins/platforms" "/usr/lib/x86_64-linux-gnu/qt6/plugins/platforms"
	)
endif()

if(QT_PLATFORMS_DIR)
	install(DIRECTORY ${QT_PLATFORMS_DIR}/
			DESTINATION platforms
			FILES_MATCHING PATTERN "*${PLATFORM_LIB}")
endif()

if(SSL_DIR)
	install(DIRECTORY ${SSL_DIR}/
			DESTINATION .
			FILES_MATCHING
			PATTERN "*crypto*"
			PATTERN "*ssl*"
	)
endif()

foreach(component IN LISTS QT_COMPONENTS)
	if(TARGET Qt6::${component})
		get_target_property(Qt6_lib Qt6::${component} IMPORTED_LOCATION)
		if(Qt6_lib AND EXISTS "${Qt6_lib}")
			if(WIN32)
				install(FILES "${Qt6_lib}" DESTINATION .)
				if(CMAKE_BUILD_TYPE STREQUAL "Debug")
					string(REPLACE ".dll" "d.dll" debug_lib "${Qt6_lib}")
					if(EXISTS "${debug_lib}")
						install(FILES "${debug_lib}" DESTINATION .)
					endif()
				endif()
			else()
				install(FILES "${Qt6_lib}" DESTINATION .)
			endif()
		endif()
	endif()
endforeach()