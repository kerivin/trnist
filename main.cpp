#include <filesystem>
#include <QApplication>
#include <QMainWindow>
#include <QMessageBox>
#include <QTextEdit>
#include <QSplitter>
#include "ui/dictionary_widget.h"
#include "ui/translation_widget.h"
#include "pybind.h"
#include "utils/embed_modules.h"

namespace fs = std::filesystem;
using namespace trnist;

int main(int argc, char* argv[])
{
	QApplication app(argc, argv);
	QMainWindow main_window;
	main_window.resize(800, 600);
	main_window.setMinimumSize(400, 300);

	trnist::py::scoped_interpreter guard{};

	try
	{
		py::module_ sys = py::module_::import("sys");
		fs::path exe_dir = fs::path(argv[0]).parent_path();
		sys.attr("path").attr("append")(fs::path(exe_dir / "py_modules").string());
		trnist::utils::EmbedModules::init();
	}
	catch (const std::exception& e)
	{
		QMessageBox::critical(&main_window, "Error", e.what());
	}

	try
	{
		QSplitter* splitter = new QSplitter(Qt::Horizontal, &main_window);
		QTextEdit* left_edit = new QTextEdit(splitter);
		QTextEdit* right_edit = new QTextEdit(splitter);
		splitter->addWidget(left_edit);
		splitter->addWidget(right_edit);
		main_window.setCentralWidget(splitter);

		trnist::ui::TranslationWidget* translation_widget = new trnist::ui::TranslationWidget(&main_window);
		trnist::ui::DictionaryWidget* dictionary_widget = new trnist::ui::DictionaryWidget(&main_window);

		main_window.addDockWidget(Qt::DockWidgetArea::RightDockWidgetArea, translation_widget);
		main_window.addDockWidget(Qt::DockWidgetArea::RightDockWidgetArea, dictionary_widget);

		translation_widget->update();
		dictionary_widget->update();

		main_window.show();
	}
	catch (const std::exception& e)
	{
		QMessageBox::critical(&main_window, "Error", e.what());
	}

	return app.exec();
}