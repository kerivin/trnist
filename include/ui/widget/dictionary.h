#pragma once
#include <QObject>
#include <QDockWidget>
#include <QCache>
#include <memory>

class QTextEdit;

namespace trnist::core::language
{
	class IDictionary;
	struct DictionaryContext;
}

namespace trnist::ui::widget
{
	class Dictionary : public QDockWidget
	{
		Q_OBJECT
	public:
		Dictionary(QWidget* parent = nullptr);
		~Dictionary();
	
	public Q_SLOTS:
		void update(const QString& word, const core::language::DictionaryContext&);

	private Q_SLOTS:
		void on_definition_html_received_(const QString& html);
		void on_definition_not_found_();
		void on_definition_error_(const QString& error);

	private:
		void update_(const QString& html);

	private:
		struct Request;

		core::language::IDictionary* const dictionary_;
		QCache<size_t /* word + language hash */, QString /* html */> cache_;
		std::unique_ptr<Request> request_;

		QTextEdit* const text_edit_;
	};
}