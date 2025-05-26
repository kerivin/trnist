#pragma once
#include <QCache>
#include "i_dictionary.h"

class QByteArray;
class QNetworkAccessManager;

namespace trnist::core::language
{
	class ApiDictionary : public IDictionary
	{
		Q_OBJECT
	public:
		ApiDictionary(QObject* parent = nullptr);
		~ApiDictionary();
		void lookup(const QString&, const DictionaryContext&) override;

	private:
		void parse_response_(const QByteArray&);

	private:
		QNetworkAccessManager* const network_;
		QCache<QString, Definition> cache_;
	};
}