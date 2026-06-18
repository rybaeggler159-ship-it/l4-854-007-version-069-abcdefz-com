(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play-button]');
    var message = box.querySelector('[data-player-message]');
    if (!video) return;
    var url = video.getAttribute('data-hls');
    var ready = false;
    var hlsInstance = null;

    var setMessage = function (text) {
      if (message) message.textContent = text || '';
    };

    var prepare = function () {
      if (ready || !url) return Promise.resolve();
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放暂不可用');
            try {
              hlsInstance.destroy();
            } catch (error) {}
          }
        });
        return Promise.resolve();
      }
      setMessage('播放暂不可用');
      return Promise.resolve();
    };

    var play = function () {
      prepare().then(function () {
        var attempt = video.play();
        if (attempt && typeof attempt.then === 'function') {
          attempt.then(function () {
            if (button) button.classList.add('is-hidden');
            setMessage('');
          }).catch(function () {
            if (button) button.classList.remove('is-hidden');
          });
        } else if (button) {
          button.classList.add('is-hidden');
        }
      });
    };

    if (button) {
      button.addEventListener('click', play);
    }
    video.addEventListener('play', function () {
      if (button) button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (button && video.currentTime === 0) button.classList.remove('is-hidden');
    });
    video.addEventListener('click', function () {
      if (video.paused) play();
    });
  });
})();
