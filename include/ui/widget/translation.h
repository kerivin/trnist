#pragma once
#include <QObject>
#include <QDockWidget>
#include "core/language/translator/translator_context.h"

class QTextEdit;

namespace trnist::core::language
{
	class ITranslator;
	struct TranslatorContext;
}

namespace trnist::ui::widget
{
	class Translation : public QDockWidget
	{
		Q_OBJECT
	public:
		Translation(QWidget* parent = nullptr);
		void update(const QString&, const core::language::TranslatorContext&);

	private Q_SLOTS:
		void on_translation_changed_(const QString&);
	
	private:
		trnist::core::language::ITranslator* const translator_;
		QTextEdit* const text_edit_;
	};
}