#include "ui/widget/dictionary.h"
#include <QTextEdit>
#include <QHash>
#include "core/language/dictionary/dictionary_context.h"
#include "core/language/dictionary/wiki_dictionary.h"

using namespace Qt::Literals::StringLiterals;

namespace
{
	constexpr size_t get_hash(const QString& word, const trnist::core::language::DictionaryContext& context)
	{
		return qHashMulti(0, word, "$[+/", context.lang);
	}
}

namespace trnist::ui::widget
{
	constexpr uint8_t MAX_RETRY_COUNT = 10;

	struct Dictionary::Request
	{
		QString word;
		core::language::DictionaryContext context;
		uint8_t retry_count = 0;
	};

	Dictionary::Dictionary(QWidget* parent)
		: QDockWidget("Dictionary", parent)
		, dictionary_(new core::language::WikiDictionary(this))
		, cache_(20)
		, text_edit_(new QTextEdit(this))
	{
		setWidget(text_edit_);
		text_edit_->setReadOnly(true);

		connect(dictionary_, &core::language::IDictionary::html_created, this, &Dictionary::on_definition_html_received_);
		connect(dictionary_, &core::language::IDictionary::not_found, this, &Dictionary::on_definition_not_found_);
		connect(dictionary_, &core::language::IDictionary::error_occured, this, &Dictionary::on_definition_error_);
	}

	Dictionary::~Dictionary() = default;

	void Dictionary::update(const QString& word, const core::language::DictionaryContext& context)
	{
		if (const auto* definition = cache_.object(get_hash(word, context)))
		{
			request_.reset();
			update_(*definition);
		}
		else
		{
			request_ = std::make_unique<Request>(word, context, 0);
			dictionary_->lookup(word, request_->context);
		}
	}
	void Dictionary::on_definition_html_received_(const QString& html)
	{
		cache_.insert(get_hash(request_->word, request_->context), new QString{ html });
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