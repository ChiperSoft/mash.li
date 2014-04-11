db.tracks.update({votes: {$exists: true}}, {$set: {votes: []}}, {multi: true});
db.tracks.update({votesActual: {$exists: true}}, {$unset: {votesActual: ''}}, {multi: true});

db.trackvotes.find().forEach(function (vote) {
	db.tracks.update({_id: vote.track}, {$addToSet: {votes: vote}});
});

/***************************************************************************************************************************************************************************/


db.tracks.aggregate([
	{$match: { 'votes.ipHash': '4b84b15bff6ee5796152495a230e45e3d7e947d9'}},
	{$unwind: "$votes"},
	{$group: {
		_id: '$votes.visitorId'
	}}
]);

db.tracks.aggregate([
	{$unwind: "$votes"},
	{$group: {
		_id: "$_id",
		visitorVoted: {
			$sum: {
				$cond: [
					{$eq: ["$votes.visitorId", 'c52d3288b4309590888df9bbc99f65970047ae4d']},
					"$votes.delta", false
				]
			}
		},
		votedUp:   {$sum: {$cond: [{ $and: [{$eq: ["$votes.delta",  1]}, {$ne: ["$votes.trusted", false]}]}, 1, 0]}},
		votedDown: {$sum: {$cond: [{ $and: [{$eq: ["$votes.delta", -1]}, {$ne: ["$votes.trusted", false]}]}, 1, 0]}},
	}}
]).result.map(function (voted) {
	var track = db.tracks.findOne({_id: voted._id});
	track.visitorVoted = voted.visitorVoted;
	track.votedUp = voted.votedUp;
	track.votedDown = voted.votedDown;
	return track;
});


/***************************************************************************************************************************************************************************/

db.tracks.update({votes: {$exists: true}}, {$unset: {votesActual: ''}}, {multi: true});