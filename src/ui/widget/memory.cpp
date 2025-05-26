#include "ui/widget/memory.h"
#include <QTextEdit>

namespace trnist::ui::widget
{
	Memory::Memory(QWidget* parent)
		: QDockWidget("Memory", parent)
		, text_edit_(new QTextEdit(this))
	{
		setWidget(text_edit_);
		text_edit_->setReadOnly(true);
	}
}