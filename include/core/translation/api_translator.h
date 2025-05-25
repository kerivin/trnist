#pragma once
#include "i_translator.h"

namespace trnist::core::translation
{
	class ApiTranslator : public ITranslator
	{
	public:
		std::u16string translate(const std::u16string&, const Context&) const override;
	};
}