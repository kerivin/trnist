rm -rf build
rm -rf bin
cmake -B build -DCMAKE_INSTALL_PREFIX=bin
sh run.sh