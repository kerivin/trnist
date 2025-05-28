#-----------------------------------------------------------------------------
# SSL
#-----------------------------------------------------------------------------

if(WIN32)
	execute_process(COMMAND ${CHOCO} install openssl -y --no-progress)
	set(SSL_PATHS 
		"C:/Program Files/OpenSSL"
		"C:/Program Files/SSL"
		"C:/Program Files/OpenSSL/bin"
		"C:/Program Files/SSL/bin"
		"${OPENSSL_ROOT_DIR}"
		"$ENV{OPENSSL_CONF}"
	)
	find_path(SSL_DIR 
		NAMES libssl-3-x64.dll
		PATHS ${SSL_PATHS}
		REQUIRED
	)
elseif(APPLE)
	execute_process(COMMAND ${BREW} install openssl@3)
	execute_process(
		COMMAND ${BREW} --prefix openssl@3
		OUTPUT_VARIABLE SSL_PREFIX
		OUTPUT_STRIP_TRAILING_WHITESPACE
	)
	set(SSL_PATHS
		"${SSL_PREFIX}"
		"${SSL_PREFIX}/lib"
		"${OPENSSL_ROOT_DIR}"
		"$ENV{OPENSSL_CONF}"
	)
	find_path(SSL_DIR
		NAMES libssl.3.dylib
		PATHS ${SSL_PATHS}
		REQUIRED
	)
	set(QT_DIR "${QT_PREFIX}/lib/cmake/Qt6")
else()
	execute_process(COMMAND sudo ${APT_GET} install -y libssl-dev)
	set(SSL_PATHS
		"/usr/lib"
		"/usr/lib/x86_64-linux-gnu"
		"/usr/lib/x86_64-linux-gnu/openssl"
		"${OPENSSL_ROOT_DIR}"
		"$ENV{OPENSSL_CONF}"
	)
	find_path(SSL_DIR
		NAMES libssl.so.3
		PATHS ${SSL_PATHS}
		REQUIRED
	)
endif()