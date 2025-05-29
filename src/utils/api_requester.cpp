#include "utils/api_requester.h"
#include <QNetworkAccessManager>
#include <QNetworkRequest>
#include <QNetworkReply>
#include <QUrl>

namespace trnist::utils
{
	ApiRequester::ApiRequester(QObject* parent)
		: QObject(parent)
		, network_(new QNetworkAccessManager(this))
	{
	}

	void ApiRequester::send_request(const QUrl& url) const
	{
		QNetworkReply* reply = network_->get(QNetworkRequest{ url });
		connect(reply, &QNetworkReply::finished, [this, reply]()
		{
			if (reply->error() == QNetworkReply::NoError)
				Q_EMIT response_received(reply->readAll());
			else
				Q_EMIT error_occured(reply->errorString());

			reply->deleteLater();
		});
	}
}