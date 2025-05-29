#include "ui/widget/dictionary.h"
#include <QTextEdit>
#include "core/language/dictionary/dictionary_context.h"
#include "core/language/dictionary/wiki_dictionary.h"

using namespace Qt::Literals::StringLiterals;

namespace trnist::ui::widget
{
	constexpr uint8_t MAX_RETRY_COUNT = 10;

	struct Dictionary::Request
	{
		QString word;
		trnist::core::language::DictionaryContext context;
		uint8_t retry_count = 0;
	};

	Dictionary::Dictionary(QWidget* parent)
		: QDockWidget("Dictionary", parent)
		, dictionary_(new trnist::core::language::WikiDictionary(this))
		, cache_(20)
		, text_edit_(new QTextEdit(this))
	{
		setWidget(text_edit_);
		text_edit_->setReadOnly(true);

		connect(dictionary_, &trnist::core::language::IDictionary::html_created, this, &Dictionary::on_definition_html_received_);
		connect(dictionary_, &trnist::core::language::IDictionary::not_found, this, &Dictionary::on_definition_not_found_);
		connect(dictionary_, &trnist::core::language::IDictionary::error_occured, this, &Dictionary::on_definition_error_);
	}

	Dictionary::~Dictionary() = default;

	void Dictionary::request_definition(const QString& word)
	{
		if (const auto* definition = cache_.object(word))
		{
			request_.reset();
			update_(*definition);
		}
		else
		{
			request_ = std::make_unique<Request>(word, trnist::core::language::DictionaryContext{ "en" });
			dictionary_->lookup(word, { "ru" });
		}
	}
	void Dictionary::on_definition_html_received_(const QString& html)
	{
		cache_.insert(request_->word, new QString{ html });
		update_(html);
		request_.reset();
	}

	void Dictionary::on_definition_not_found_()
	{
		update_(u"<center>✕</center>"_s);
	}

	void Dictionary::on_definition_error_(const QString& error)
	{
		if (request_ && request_->retry_count <= MAX_RETRY_COUNT)
		{
			dictionary_->lookup(request_->word, request_->context);
			++request_->retry_count;
		}
		else
		{
			request_.reset();
			text_edit_->setText(error);
		}
	}

	void Dictionary::update_(const QString& html)
	{
		text_edit_->setHtml(html);
	}
}