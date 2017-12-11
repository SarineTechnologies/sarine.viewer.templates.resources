(function (window, document, tplUtils) {
	'use strict';
	var isInitial = true,
		name = '';
	// id is a string with iframe's id
	window.runSarineYoutubePlayer = function (id) {
		var player,
			tag = document.createElement('script'),
			devLog = tplUtils.devLog;
				
		if (isInitial) {
			tag.src = "https://www.youtube.com/iframe_api";
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

	        devLog('youtube isInitial', isInitial, id);
	        isInitial = false;
		}

		window.onYouTubeIframeAPIReady = function () {
			player = new YT.Player(id, {
				events: {
					'onReady': onPlayerReady,
					'onStateChange': onPlayerStateChange
				}
			});
		};

		document.addEventListener('playSarineYoutube', function (e) {
			console.log('***playSarineYoutube');
			name = e.detail || '';

			if (player && player.playVideo) {
				player.playVideo();
			}

		}, false);

		document.addEventListener('stopSarineYoutube', function (e) {
			if (player && player.stopVideo && player.seekTo && player.getPlayerState() !== -1 &&  player.getPlayerState() !== 5) {
				player.seekTo(0, true);
				player.stopVideo();
			}

		}, false);

		function onPlayerReady(event) {
        	devLog('youtube ready');
        	if (name) {
        		tplUtils.fire(document, 'playSarineYoutube');
        	}
     	};

      	function onPlayerStateChange(event) {
        	devLog('youtube change state');
      	};

	};
})(window, window.document, window.tplUtils);
