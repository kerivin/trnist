#pragma once
#include <QString>

namespace trnist::core::language
{
	struct TranslatorContext
	{
		QString api;
		QString from_lang{"auto"};
		QString to_lang{"en"};
	};
}