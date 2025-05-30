#include "ui/widget/translation.h"
#include <QTextEdit>
#include "core/language/translator/api_translator.h"
#include "core/language/translator/translator_context.h"

namespace trnist::ui::widget
{
	Translation::Translation(QWidget* parent)
		: QDockWidget("Translation", parent)
		, translator_(new core::language::ApiTranslator(this))
		, text_edit_(new QTextEdit(this))
	{
		setWidget(text_edit_);
		text_edit_->setReadOnly(true);
		connect(translator_, &core::language::ITranslator::translate_received, this, &Translation::on_translation_changed_);
	}

	void Translation::update(const QString& text, const core::language::TranslatorContext& context)
	{
		translator_->translate(text, context);
	}

	void Translation::on_translation_changed_(const QString& translation)
	{
		text_edit_->setText(translation);
	}
}