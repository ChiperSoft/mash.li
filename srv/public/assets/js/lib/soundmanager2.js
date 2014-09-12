
define(['SoundManager'], function (SM) {
	SM.soundManager.setup({
		url: '/assets/vendor/soundmanager2/swf/',
		debugMode: false,
		preferFlash: false,
		useHighPerformance: true,
		flashVersion: 9,
		ontimeout: function () {
			console.warn('SM2 init failed!');
		},
	});
	SM.soundManager.beginDelayedInit();

	return SM.soundManager;
});
