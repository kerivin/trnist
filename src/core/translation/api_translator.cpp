#include "core/translation/api_translator.h"
#include <stdexcept>
#include "pybind.h"
#include "core/translation/context.h"

// https://github.com/UlionTse/translators

namespace trnist::core::translation
{
    std::u16string ApiTranslator::translate(const std::u16string& text, const Context& context) const
    {
        try {
            py::gil_scoped_acquire python_quard;
            auto translators = py::module_::import("translators");
            py::object result = translators.attr("translate_text")(text, context.api, context.from_lang, context.to_lang);
            return result.cast<std::u16string>();
        } catch (const py::error_already_set& e) {
            throw std::runtime_error("Translation failed: " + std::string(e.what()));
        }
    }
}