#pragma once
#include <QString>
#include <vector>

namespace trnist::core::language
{
	struct Explanation
	{
		QString description;
		QString example;
	};
	struct Meaning
	{
		QString part_of_speech;
		std::vector<Explanation> explanations;
	};

	struct Definition
	{
		QString word;
		QString phonetic;
		std::vector<Meaning> meanings;
	};
}