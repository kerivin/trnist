#pragma once
#include <QObject>
#include <QString>

namespace trnist::core::language
{
	struct TranslatorContext;

	class ITranslator : public QObject
	{
		Q_OBJECT
	public:
		using QObject::QObject;
		virtual ~ITranslator() = default;
		virtual void translate(const QString&, const TranslatorContext&) = 0;

	Q_SIGNALS:
		void translate_received(const QString&);
		void error_occured(const QString&);
	};
}