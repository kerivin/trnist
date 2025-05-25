#-----------------------------------------------------------------------------
# INSTALL
#-----------------------------------------------------------------------------

set(PYTHON_MODULES_DIR "py_modules")

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

if(WIN32)
	if(QT_PLATFORMS_DIR)
		install(DIRECTORY ${QT_PLATFORMS_DIR}/
				DESTINATION platforms
				FILES_MATCHING PATTERN "*.dll")
	endif()
	if(Qt6_core_location)
		foreach(component IN LISTS QT_COMPONENTS)
			if(TARGET Qt6::${component})
				install(FILES "${QT_BIN_DIR}/Qt6${component}.dll"
						DESTINATION .)
				if(CMAKE_BUILD_TYPE STREQUAL "Debug")
					install(FILES "${QT_BIN_DIR}/Qt6${component}d.dll"
							DESTINATION .)
				endif()
			endif()
		endforeach()
	endif()
endif()

if(UNIX AND QT_PLATFORMS_DIR)
	install(DIRECTORY ${QT_PLATFORMS_DIR}/
			DESTINATION platforms
			FILES_MATCHING PATTERN "*${PLATFORM_LIB}")
endif()

include(InstallRequiredSystemLibraries)

set(CPACK_PACKAGE_NAME "${PROJECT_NAME}")
set(CPACK_PACKAGE_INSTALL_DIRECTORY "${PROJECT_NAME}")

if(WIN32)
	set(CPACK_GENERATOR "NSIS;ZIP")
	set(CPACK_NSIS_MODIFY_PATH ON)
elseif(APPLE)
	set(CPACK_GENERATOR "DragNDrop;TGZ")
else()
	set(CPACK_GENERATOR "DEB;TGZ")
endif()

include(CPack)

# Linux/macOS stripping
if(UNIX AND NOT APPLE)
  install(CODE "execute_process(
    COMMAND find ${CMAKE_INSTALL_PREFIX} -name \"*.so\" -exec strip {} \;
  )")
endif()

# Windows UPX compression (optional)
if(WIN32 AND EXISTS "C:/upx/upx.exe")
  install(CODE "execute_process(
    COMMAND C:/upx/upx --best ${CMAKE_INSTALL_PREFIX}/${PYTHON_MODULES_DIR}/PyQt6/*.dll
  )")
endif()