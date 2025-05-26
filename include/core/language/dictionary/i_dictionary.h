#pragma once
#include <QObject>
#include <QString>
#include <optional>

namespace trnist::core::language
{
	class DictionaryContext;
	struct Definition;

	class IDictionary : public QObject
	{
		Q_OBJECT
	public:
		using QObject::QObject;
		virtual ~IDictionary() = default;
		virtual void lookup(const QString&, const DictionaryContext&) = 0;

	Q_SIGNALS:
		void definition_received(const Definition&);
    	void error_occured(const QString&);
	};
}