#include <filesystem>
#include <QApplication>
#include <QMainWindow>
#include <QMessageBox>
#include <QTextEdit>
#include <QSplitter>
#include "ui/widget/dictionary.h"
#include "ui/widget/translation.h"
#include "ui/widget/structure.h"
#include "ui/widget/memory.h"
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

	py::scoped_interpreter guard{};

	try
	{
		py::module_ sys = py::module_::import("sys");
		fs::path exe_dir = fs::path(argv[0]).parent_path();
		sys.attr("path").attr("append")(fs::path(exe_dir / "py_modules").string());
		utils::EmbedModules::init();
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

		ui::widget::Structure* structure_widget = new ui::widget::Structure(&main_window);
		ui::widget::Memory* memory_widget = new ui::widget::Memory(&main_window);
		main_window.addDockWidget(Qt::DockWidgetArea::LeftDockWidgetArea, structure_widget);
		main_window.addDockWidget(Qt::DockWidgetArea::LeftDockWidgetArea, memory_widget);

		ui::widget::Translation* translation_widget = new ui::widget::Translation(&main_window);
		ui::widget::Dictionary* dictionary_widget = new ui::widget::Dictionary(&main_window);
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