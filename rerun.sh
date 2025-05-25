rm -rf build
rm -rf tmp
cmake -B build -DCMAKE_INSTALL_PREFIX=tmp
sh run.sh