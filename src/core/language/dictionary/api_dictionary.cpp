#include "core/language/dictionary/api_dictionary.h"
#include <QNetworkAccessManager>
#include <QNetworkRequest>
#include <QNetworkReply>
#include <QJsonDocument>
#include <QJsonArray>
#include <QJsonObject>
#include <QJsonValue>
#include <QByteArray>
#include <QUrl>
#include "core/language/dictionary/dictionary_context.h"
#include "core/language/dictionary/definition.h"

// https://dictionaryapi.dev/

namespace trnist::core::language
{
	ApiDictionary::ApiDictionary(QObject* parent)
		: IDictionary(parent), network_(new QNetworkAccessManager(this)), cache_(20)
	{
	}

	ApiDictionary::~ApiDictionary() = default;

	void ApiDictionary::lookup(const QString& word, const DictionaryContext& context)
	{
		if (cache_.contains(word))
		{
			Q_EMIT definition_received(*cache_[word]);
			return;
		}

		QUrl url(QString("https://api.dictionaryapi.dev/api/v2/entries/%1/%2")
			.arg(context.lang)
			.arg(word));
		QNetworkReply* reply = network_->get(QNetworkRequest{ url });
		connect(reply, &QNetworkReply::finished, [this, reply]()
		{
			if (reply->error() != QNetworkReply::NoError)
				Q_EMIT error_occured(reply->errorString());
			else
				parse_response_(reply->readAll());

			reply->deleteLater();
		});
	}

	void ApiDictionary::parse_response_(const QByteArray& data)
	{
		QJsonDocument json = QJsonDocument::fromJson(data);
		if (!json.isArray())
		{
			Q_EMIT error_occured("Invalid response format");
			return;
		}
		const auto& json_entries = json.array();
		if (json_entries.empty())
		{
			Q_EMIT error_occured("Empty response");
			return;
		}

		Definition* definition = nullptr;
		for (const auto& json_entry : json_entries)
		{
			const auto& entry_object = json_entry.toObject();
			const auto& word = entry_object["word"].toString();
			if (!definition)
			{
				definition = new Definition;
				cache_.insert(word, definition);
				definition->word = word;
			}

			if (!entry_object["phonetic"].isNull())
				definition->phonetic = entry_object["phonetic"].toString();
			else if (!entry_object["phonetics"].isNull() && entry_object["phonetics"].isArray())
				definition->phonetic = entry_object["phonetics"].toArray()[0].toObject()["text"].toString();
			
			const auto& json_meanings = entry_object["meanings"].toArray();
			definition->meanings.reserve(json_meanings.size());
			for (const auto& json_meaning : json_meanings)
			{
				const auto& meaning_object = json_meaning.toObject();
				auto& meaning = definition->meanings.emplace_back();
				meaning.part_of_speech = meaning_object["partOfSpeech"].toString();
				const auto& json_explanations = meaning_object["definitions"].toArray();
				meaning.explanations.reserve(json_explanations.size());
				for (const auto& json_explanation : json_explanations)
				{
					const auto& explanation_object = json_explanation.toObject();
					meaning.explanations.emplace_back(explanation_object["definition"].toString(),
													explanation_object["example"].toString());
				}
			}
		}
		Q_EMIT definition_received(*definition);
	}
}