#include "ui/dictionary_widget.h"
#include <QTextEdit>
#include "core/language/dictionary/api_dictionary.h"
#include "core/language/dictionary/dictionary_context.h"
#include "core/language/dictionary/definition.h"

namespace trnist::ui
{
	DictionaryWidget::DictionaryWidget(QWidget* parent)
		: QDockWidget("Dictionary", parent)
		, dictionary_(new trnist::core::language::ApiDictionary(this))
		, text_edit_(new QTextEdit(this))
	{
		setWidget(text_edit_);
		text_edit_->setReadOnly(true);
		connect(dictionary_, &trnist::core::language::IDictionary::definition_received, this, &DictionaryWidget::on_definition_changed_);
	}

	void DictionaryWidget::update()
	{
		dictionary_->lookup("enlarge", { "en" });
	}

	void DictionaryWidget::on_definition_changed_(const trnist::core::language::Definition& definition)
	{
		QString text = definition.word + "\n" + definition.phonetic;
		text_edit_->setText(std::move(text));
	}
}