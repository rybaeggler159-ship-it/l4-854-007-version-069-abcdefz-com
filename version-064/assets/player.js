(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function setupPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-start');
    var source = video && video.querySelector('source');
    var src = source ? source.getAttribute('src') : '';
    var initialized = false;
    var hls = null;

    function prepare() {
      if (!video || initialized || !src) {
        return;
      }
      initialized = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function play() {
      prepare();
      shell.classList.add('is-started');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          shell.classList.remove('is-started');
        });
      }
    }

    if (!video || !button) {
      return;
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      shell.classList.add('is-started');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        shell.classList.remove('is-started');
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
  });
})();
