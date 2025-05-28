#include "ui/widget/dictionary.h"
#include <QTextEdit>
#include "core/language/dictionary/api_dictionary.h"
#include "core/language/dictionary/dictionary_context.h"
#include "core/language/dictionary/definition.h"

namespace trnist::ui::widget
{
	constexpr uint8_t MAX_RETRY_COUNT = 10;

	Dictionary::Dictionary(QWidget* parent)
		: QDockWidget("Dictionary", parent)
		, dictionary_(new trnist::core::language::ApiDictionary(this))
		, text_edit_(new QTextEdit(this))
	{
		setWidget(text_edit_);
		text_edit_->setReadOnly(true);

		connect(dictionary_, &trnist::core::language::IDictionary::definition_received, this, &Dictionary::on_definition_received_);
		connect(dictionary_, &trnist::core::language::IDictionary::error_occured, this, &Dictionary::on_definition_error_);
	}

	void Dictionary::update()
	{
		on_word_selected_("crop");
	}

	void Dictionary::on_definition_received_(const trnist::core::language::Definition& definition)
	{
		auto text = QString("<header><strong>%1</strong><span>\t%2</span></header><br>")
			.arg(definition.word)
			.arg(definition.phonetic);
		if (!definition.meanings.empty())
		{
			QString meanings;
			for (const auto& meaning : definition.meanings)
			{
				meanings += QString("<section><span>%1</span><ol>")
					.arg(meaning.part_of_speech);
				for (const auto& exaplanation : meaning.explanations)
				{
					meanings += QString("<li><p>%1</p><q><i>%2</i></q></li>")
						.arg(exaplanation.description)
						.arg(exaplanation.example);
				}
				meanings += "</ol></section>";
			}
			text += "<div>" + meanings + "</div>";
		}
		text_edit_->setHtml(text);
	}

	void Dictionary::on_definition_error_(const QString& error)
	{
		if (retry_count <= MAX_RETRY_COUNT)
		{
			dictionary_->lookup(word_, { "en" });
			++retry_count;
		}
		else
		{
			text_edit_->setText(error);
		}
	}

	void Dictionary::on_word_selected_(const QString& word)
	{
		retry_count = 0;
		word_ = word;
		dictionary_->lookup(word, { "en" });
	}
}