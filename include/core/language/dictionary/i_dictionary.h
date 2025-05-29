#pragma once
#include <QObject>
#include <QString>

namespace trnist::core::language
{
	struct DictionaryContext;

	class IDictionary : public QObject
	{
		Q_OBJECT
	public:
		using QObject::QObject;
		virtual ~IDictionary() = default;
		virtual void lookup(const QString& word, const DictionaryContext&) const = 0;

	Q_SIGNALS:
		void html_created(const QString& html) const;
		void not_found() const;
    	void error_occured(const QString& error) const;
	};
}