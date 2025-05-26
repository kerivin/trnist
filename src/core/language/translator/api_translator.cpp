#include "core/language/translator/api_translator.h"
#include <stdexcept>
#include "pybind.h"
#include "core/language/translator/translator_context.h"

// https://github.com/UlionTse/translators

namespace trnist::core::language
{
	void ApiTranslator::translate(const QString& text, const TranslatorContext& context)
	{
		try
		{
			py::gil_scoped_acquire python_quard;
			auto translators = py::module_::import("translators");
			py::object result = translators.attr("translate_text")(text.toStdU16String(), context.api.toStdString(),
				context.from_lang.toStdString(), context.to_lang.toStdString());
			Q_EMIT translate_received(QString::fromStdU16String(result.cast<std::u16string>()));
		}
		catch (const py::error_already_set& e)
		{
			Q_EMIT error_occured(QString::fromStdString("Translation failed: " + std::string(e.what())));
		}
	}
}