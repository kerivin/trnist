#pragma once
#include <QObject>
#include <QDockWidget>

class QTextEdit;

namespace trnist::ui::widget
{
	class Structure : public QDockWidget
	{
		Q_OBJECT
	public:
		Structure(QWidget* parent = nullptr);
		void update();

	private Q_SLOTS:

	private:
		QTextEdit* const text_edit_;
	};
}