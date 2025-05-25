#include <filesystem>
#include <QApplication>
#include <QMainWindow>
#include <QMessageBox>
#include "core/translation/api_translator.h"
#include "core/translation/context.h"
#include "pybind.h"
#include "utils/embed_modules.h"

namespace fs = std::filesystem;
using namespace trnist;

int main(int argc, char *argv[])
{
	QApplication app(argc, argv);
	QMainWindow main_window;
	main_window.resize(800, 600);
	main_window.setMinimumSize(400, 300);
	main_window.show();

	trnist::py::scoped_interpreter guard{};

	try
	{
		py::module_ sys = py::module_::import("sys");
		fs::path exe_dir = fs::path(argv[0]).parent_path();
		sys.attr("path").attr("append")(fs::path(exe_dir / "py_modules").string());
		trnist::utils::EmbedModules::init();
	}
	catch (const std::exception &e)
	{
		QMessageBox::critical(&main_window, "Error", e.what());
	}

	try
	{
		trnist::core::translation::ApiTranslator translator;
		QString result = QString::fromStdU16String(translator.translate(u"Alas, poor country! Almost afraid to know itself!",
																		{.api = "yandex", .from_lang = "en", .to_lang = "ru"}));
		QMessageBox::information(&main_window, "Alas, poor country! Almost afraid to know itself!", result);
	}
	catch (const std::exception &e)
	{
		QMessageBox::critical(&main_window, "Error", e.what());
	}

	return app.exec();
}