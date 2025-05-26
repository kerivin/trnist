#pragma once
#include <QString>
#include <vector>

namespace trnist::core::language
{
	struct Meaning
	{
		QString part_of_speech;
		std::vector<QString> explanations;
	};

	struct Definition
	{
		QString word;
		QString phonetic;
		std::vector<Meaning> meanings;
	};
}