#pragma once
#include <QObject>
#include <QDockWidget>

class QTextEdit;

namespace trnist::core::language
{
	struct Definition;
	class IDictionary;
}

namespace trnist::ui::widget
{
	class Dictionary : public QDockWidget
	{
		Q_OBJECT
	public:
		Dictionary(QWidget* parent = nullptr);
		void update();

	private Q_SLOTS:
		void on_definition_received_(const trnist::core::language::Definition&);
		void on_definition_error_(const QString&);
		void on_word_selected_(const QString&);

	private:
		trnist::core::language::IDictionary* const dictionary_;
		QTextEdit* const text_edit_;
		QString word_;
		uint8_t retry_count = 0;
	};
}