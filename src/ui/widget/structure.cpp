#include "ui/widget/structure.h"
#include <QTextEdit>

namespace trnist::ui::widget
{
	Structure::Structure(QWidget* parent)
		: QDockWidget("Structure", parent)
		, text_edit_(new QTextEdit(this))
	{
		setWidget(text_edit_);
		text_edit_->setReadOnly(true);
	}
}