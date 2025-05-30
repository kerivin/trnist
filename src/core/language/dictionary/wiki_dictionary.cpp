#include "core/language/dictionary/wiki_dictionary.h"
#include <QJsonDocument>
#include <QJsonArray>
#include <QJsonObject>
#include <QJsonValue>
#include <QByteArray>
#include <QUrl>
#include "core/language/dictionary/dictionary_context.h"

// https://en.wikipedia.org/w/api.php?action=help&modules=query

namespace trnist::core::language
{
	WikiDictionary::WikiDictionary(QObject* parent)
		: IDictionary(parent)
		, api_requester_(new utils::ApiRequester(this))
	{
		connect(api_requester_, &utils::ApiRequester::response_received, this, &WikiDictionary::parse_response_);
		connect(api_requester_, &utils::ApiRequester::error_occured, this, &WikiDictionary::error_occured);
	}

	void WikiDictionary::lookup(const QString& word, const DictionaryContext& context) const
	{
		QUrl url(QString("https://%1.wiktionary.org/w/api.php?action=query&format=json&titles=%2&prop=extracts&redirects=true")
			.arg(context.lang)
			.arg(word));
		api_requester_->send_request(url);
	}

	void WikiDictionary::parse_response_(const QByteArray& data) const
	{
		QJsonDocument json = QJsonDocument::fromJson(data);
		if (!json.isObject())
		{
			Q_EMIT error_occured("Invalid response format: not a json");
			return;
		}
		const auto& json_pages = json.object()["query"].toObject()["pages"].toObject();
		const auto& json_keys = json_pages.keys();
		if (json_keys.isEmpty())
		{
			Q_EMIT not_found();
			return;
		}
		const auto& page_id = json_keys.front();
		if (page_id.toLong() < 0)
		{
			Q_EMIT not_found();
			return;
		}
		const auto& json_page = json_pages.value(page_id).toObject();
		QString html = json_page["extract"].toString();
		html.replace(QRegularExpression(R"(<(/?)h1\b)"), "<\\1h2");
		Q_EMIT html_created(html);
	}
}