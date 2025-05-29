#include "core/language/dictionary/free_dictionary_api.h"
#include <QJsonDocument>
#include <QJsonArray>
#include <QJsonObject>
#include <QJsonValue>
#include <QByteArray>
#include <QUrl>
#include "core/language/dictionary/dictionary_context.h"

// https://dictionaryapi.dev/

namespace trnist::core::language
{
	FreeDictionaryApi::FreeDictionaryApi(QObject* parent)
		: IDictionary(parent)
		, api_requester_(new utils::ApiRequester(this))
	{
		connect(api_requester_, &utils::ApiRequester::response_received, this, &FreeDictionaryApi::parse_response_);
		connect(api_requester_, &utils::ApiRequester::error_occured, this, &FreeDictionaryApi::error_occured);
	}

	void FreeDictionaryApi::lookup(const QString& word, const DictionaryContext& context) const
	{
		QUrl url(QString("https://api.dictionaryapi.dev/api/v2/entries/%1/%2")
			.arg(context.lang)
			.arg(word));
		
		api_requester_->send_request(url);
	}

	void FreeDictionaryApi::parse_response_(const QByteArray& data) const
	{
		QJsonDocument json = QJsonDocument::fromJson(data);
		if (!json.isArray())
		{
			Q_EMIT not_found();
			return;
		}
		const auto& json_entries = json.array();
		if (json_entries.empty())
		{
			Q_EMIT not_found();
			return;
		}

		QString html;
		for (const auto& json_entry : json_entries)
		{
			const auto& entry_object = json_entry.toObject();
			{
				const QString& word = entry_object["word"].toString();
				QString phonetic;
				if (!entry_object["phonetic"].isNull())
					phonetic = entry_object["phonetic"].toString();
				else if (!entry_object["phonetics"].isNull() && entry_object["phonetics"].isArray())
					phonetic = entry_object["phonetics"].toArray()[0].toObject()["text"].toString();

				if (!html.isEmpty())
					html = QString("<header><strong>%1</strong><span>\t%2</span></header><br>")
					.arg(word)
					.arg(phonetic);
			}

			const auto& json_meanings = entry_object["meanings"].toArray();
			if (!json_meanings.isEmpty())
			{
				QString meanings;
				for (const auto& json_meaning : json_meanings)
				{
					const auto& meaning_object = json_meaning.toObject();
					meanings += QString("<section><span>%1</span><ol>")
						.arg(meaning_object["partOfSpeech"].toString());
					
					const auto& json_explanations = meaning_object["definitions"].toArray();
					for (const auto& json_explanation : json_explanations)
					{
						const auto& explanation_object = json_explanation.toObject();
						meanings += QString("<li><p>%1</p><q><i>%2</i></q></li>")
							.arg(explanation_object["definition"].toString())
							.arg(explanation_object["example"].toString());
					}
					meanings += "</ol></section>";
				}
				html += "<div>" + meanings + "</div>";
			}
		}
		Q_EMIT html_created(html);
	}
}