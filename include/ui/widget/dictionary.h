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
		void on_definition_changed_(const trnist::core::language::Definition&);

	private:
		trnist::core::language::IDictionary* const dictionary_;
		QTextEdit* const text_edit_;
	};
}