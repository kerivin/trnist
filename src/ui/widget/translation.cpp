#include "ui/widget/translation.h"
#include <QTextEdit>
#include "core/language/translator/api_translator.h"
#include "core/language/translator/translator_context.h"

namespace trnist::ui::widget
{
	Translation::Translation(QWidget* parent)
		: QDockWidget("Translation", parent)
		, translator_(new trnist::core::language::ApiTranslator(this))
		, text_edit_(new QTextEdit(this))
	{
		setWidget(text_edit_);
		text_edit_->setReadOnly(true);
		connect(translator_, &trnist::core::language::ITranslator::translate_received, this, &Translation::on_translation_changed_);
	}

	void Translation::update()
	{
		translator_->translate("It cannot be called our mother, but our grave.", { .api = "yandex", .from_lang = "en", .to_lang = "ru" });
	}

	void Translation::on_translation_changed_(const QString& translation)
	{
		text_edit_->setText(translation);
	}
}