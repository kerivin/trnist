#pragma once
#include <QObject>

class QUrl;
class QByteArray;
class QNetworkAccessManager;

namespace trnist::utils
{
	class ApiRequester : public QObject
	{
		Q_OBJECT
	public:
		ApiRequester(QObject* parent = nullptr);
		virtual ~ApiRequester() = default;
		void send_request(const QUrl&) const;

	Q_SIGNALS:
		void response_received(const QByteArray&) const;
		void error_occured(const QString&) const;

	private:
		QNetworkAccessManager* const network_;
	};
}