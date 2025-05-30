#include <filesystem>
#include <QApplication>
#include <QMainWindow>
#include <QMessageBox>
#include <QTextEdit>
#include <QSplitter>
#include <QThread>
#include <QRegularExpression>
#include "ui/widget/dictionary.h"
#include "ui/widget/translation.h"
#include "ui/widget/structure.h"
#include "ui/widget/memory.h"
#include "utils/embed_modules.h"
#include "pybind.h"
#include "core/language/dictionary/dictionary_context.h"

namespace fs = std::filesystem;
using namespace trnist;

inline bool is_single_word(const QString& text)
{
	return QRegularExpression(R"(^\w+$)").match(text).hasMatch();
}

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

	qDebug() << "Ideal thread count: " << QThread::idealThreadCount();

	QThread translation_thread;
	QThread definition_thread;

	try
	{
		QSplitter* splitter = new QSplitter(Qt::Horizontal, &main_window);
		QTextEdit* translation_edit = new QTextEdit(splitter);
		QTextEdit* original_edit = new QTextEdit(splitter);
		// original_edit->setReadOnly(true);
		splitter->addWidget(translation_edit);
		splitter->addWidget(original_edit);
		main_window.setCentralWidget(splitter);

		ui::widget::Structure* structure_widget = new ui::widget::Structure(&main_window);
		ui::widget::Memory* memory_widget = new ui::widget::Memory(&main_window);
		main_window.addDockWidget(Qt::DockWidgetArea::LeftDockWidgetArea, structure_widget);
		main_window.addDockWidget(Qt::DockWidgetArea::LeftDockWidgetArea, memory_widget);

		{
			ui::widget::Translation* translation_widget = new ui::widget::Translation(&main_window);
			ui::widget::Dictionary* dictionary_widget = new ui::widget::Dictionary(&main_window);
			main_window.addDockWidget(Qt::DockWidgetArea::RightDockWidgetArea, translation_widget);
			main_window.addDockWidget(Qt::DockWidgetArea::RightDockWidgetArea, dictionary_widget);

			translation_widget->moveToThread(&translation_thread);
			QObject::connect(&translation_thread, &QThread::finished, translation_widget, &QObject::deleteLater);
			dictionary_widget->moveToThread(&definition_thread);
			QObject::connect(&definition_thread, &QThread::finished, dictionary_widget, &QObject::deleteLater);

			QObject::connect(translation_edit, &QTextEdit::selectionChanged, [&]()
			{
				qDebug() << "translation_edit selectionChanged";
				QSignalBlocker blocker1(translation_edit);
				QSignalBlocker blocker2(dictionary_widget);

				const QString selected_text = translation_edit->textCursor().selectedText();
				if (is_single_word(selected_text))
					dictionary_widget->update(selected_text, { "ru" });
			});
			QObject::connect(original_edit, &QTextEdit::selectionChanged, [&]()
			{
				qDebug() << "original_edit selectionChanged";
				QSignalBlocker blocker1(original_edit);
				QSignalBlocker blocker2(dictionary_widget);
				QSignalBlocker blocker3(translation_widget);

				const QString selected_text = original_edit->textCursor().selectedText();
				if (is_single_word(selected_text))
					dictionary_widget->update(selected_text, { "en" });
				translation_widget->update(selected_text, { .api = "yandex", .from_lang = "en", .to_lang = "ru" });
			});
		}

		main_window.show();
	}
	catch (const std::exception& e)
	{
		QMessageBox::critical(&main_window, "Error", e.what());
	}

	translation_thread.start();
	definition_thread.start();

	return app.exec();
}