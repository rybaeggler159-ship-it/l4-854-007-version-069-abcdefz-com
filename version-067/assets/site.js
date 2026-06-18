(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    var show = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };

    var restart = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    restart();
  }

  var panels = document.querySelectorAll('.js-filter-panel');

  panels.forEach(function (panel) {
    var input = panel.querySelector('[data-filter-input]');
    var yearSelect = panel.querySelector('[data-year-filter]');
    var regionSelect = panel.querySelector('[data-region-filter]');
    var grid = panel.parentElement ? panel.parentElement.querySelector('.movie-grid') : null;
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.js-search-card')) : [];

    var apply = function () {
      var query = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var yearMatched = !year || card.getAttribute('data-year') === year;
        var regionMatched = !region || card.getAttribute('data-region') === region;
        var queryMatched = !query || text.indexOf(query) !== -1;
        card.classList.toggle('is-hidden', !(yearMatched && regionMatched && queryMatched));
      });
    };

    if (input) {
      input.addEventListener('input', apply);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', apply);
    }

    if (regionSelect) {
      regionSelect.addEventListener('change', apply);
    }

    var params = new URLSearchParams(window.location.search);
    var queryParam = params.get('q');

    if (input && queryParam) {
      input.value = queryParam;
      apply();
    }
  });

  window.StaticMoviePlayer = {
    setup: function (playerId, streamUrl) {
      var shell = document.getElementById(playerId);

      if (!shell) {
        return;
      }

      var video = shell.querySelector('video');
      var button = shell.querySelector('.js-play-button');
      var hls = null;
      var ready = false;

      var prepare = function () {
        if (ready || !video) {
          return;
        }

        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          video.load();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          return;
        }

        video.src = streamUrl;
        video.load();
      };

      var play = function () {
        prepare();

        if (button) {
          button.classList.add('is-hidden');
        }

        video.play().catch(function () {});
      };

      if (button) {
        button.addEventListener('click', play);
      }

      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          }
        });
      }

      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  };
})();
