#pragma once
#include "i_translator.h"

namespace trnist::core::language
{
	class ApiTranslator : public ITranslator
	{
		Q_OBJECT
	public:
		using ITranslator::ITranslator;
		void translate(const QString&, const TranslatorContext&) override;
	};
}