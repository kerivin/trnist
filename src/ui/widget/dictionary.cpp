#include "ui/widget/dictionary.h"
#include <QTextEdit>
#include "core/language/dictionary/api_dictionary.h"
#include "core/language/dictionary/dictionary_context.h"
#include "core/language/dictionary/definition.h"

namespace trnist::ui::widget
{
	Dictionary::Dictionary(QWidget* parent)
		: QDockWidget("Dictionary", parent)
		, dictionary_(new trnist::core::language::ApiDictionary(this))
		, text_edit_(new QTextEdit(this))
	{
		setWidget(text_edit_);
		text_edit_->setReadOnly(true);
		connect(dictionary_, &trnist::core::language::IDictionary::definition_received, this, &Dictionary::on_definition_changed_);
	}

	void Dictionary::update()
	{
		dictionary_->lookup("enlarge", { "en" });
	}

	void Dictionary::on_definition_changed_(const trnist::core::language::Definition& definition)
	{
		QString text = "<h3>" + definition.word + "</h3><p><i>" + definition.phonetic + "</i></p>";
		text_edit_->setHtml(std::move(text));
	}
}