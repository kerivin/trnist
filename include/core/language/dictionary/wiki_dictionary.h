#pragma once
#include "i_dictionary.h"
#include "utils/api_requester.h"

namespace trnist::core::language
{
	class WikiDictionary : public IDictionary
	{
		Q_OBJECT
	public:
		WikiDictionary(QObject* parent = nullptr);
		void lookup(const QString&, const DictionaryContext&) const override;

	private:
		void parse_response_(const QByteArray&) const;
	
	private:
		utils::ApiRequester* const api_requester_;
	};
}