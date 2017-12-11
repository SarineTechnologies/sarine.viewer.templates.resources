(function (window, document, classie, tplUtils, gaUtils) {
  'use strict';

  var videoPlay = {
    initButton: initButton
  };

  window.videoPlay = videoPlay;

  function initButton(btn) {
    var videoId = btn.getAttribute('data-video-id'),
        videoElement = document.getElementById(videoId || ''),
        forceReloaded = false;
        
    if (!videoElement) {
      return;
    }

    showBtn();

    videoElement.addEventListener('ended', showBtn);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('canplay', handleCanPlay);   

    videoElement.addEventListener('play', function () {
      hideBtn();
    });

    btn.addEventListener('click', function (e) {
      if (videoElement.readyState < 3) {
        videoElement.src = videoElement.getAttribute('data-video-src');
        videoElement.preload = 'auto';
        videoElement.load();
        forceReloaded = true;
        classie.add(btn, 'video-play--loading');  
      } else {
        startPlaying();
      }
    });

    function showBtn () {
      videoElement.style.display = 'none';
      btn.style.display = '';
    }

    function handlePause () {
      gaUtils && gaUtils.videoFn('Pause');
      showBtn();
    }

    function hideBtn () {
      btn.style.display = 'none';
      videoElement.style.display = '';
    }

    function startPlaying () {
      gaUtils && gaUtils.videoFn('Play');
      videoElement.play();
      hideBtn();
    }

    function handleCanPlay () {
      if (forceReloaded) {
        forceReloaded = false;
        startPlaying();
        classie.remove(btn, 'video-play--loading');
      }
    }
  }
})(window, window.document, window.classie, window.tplUtils, window.gaUtils);