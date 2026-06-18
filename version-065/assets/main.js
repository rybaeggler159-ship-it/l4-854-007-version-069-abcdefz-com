(function () {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-button]');
  var mobileNav = qs('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  qsa('[data-hero]').forEach(function (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      window.clearInterval(timer);
      play();
    }

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

    show(0);
    play();
  });

  qsa('[data-filter-panel]').forEach(function (panel) {
    var section = panel.closest('.content-section') || document;
    var cards = qsa('[data-title]', section);
    var input = qs('[data-search-input]', panel);
    var selects = qsa('[data-filter-field]', panel);
    var empty = qs('[data-empty-state]', section);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (query && input) {
      input.value = query;
    }

    selects.forEach(function (select) {
      var field = select.getAttribute('data-filter-field');
      var values = [];
      cards.forEach(function (card) {
        var value = card.getAttribute('data-' + field);
        if (value && values.indexOf(value) === -1) {
          values.push(value);
        }
      });
      values.sort(function (a, b) {
        return b.localeCompare(a, 'zh-Hans-CN', { numeric: true });
      });
      values.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    });

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var activeFilters = {};
      selects.forEach(function (select) {
        activeFilters[select.getAttribute('data-filter-field')] = select.value;
      });
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-type'),
          card.getAttribute('data-category')
        ].join(' ').toLowerCase();
        var passKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var passFilters = Object.keys(activeFilters).every(function (field) {
          return !activeFilters[field] || card.getAttribute('data-' + field) === activeFilters[field];
        });
        var pass = passKeyword && passFilters;
        card.style.display = pass ? '' : 'none';
        if (pass) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
    apply();
  });

  qsa('[data-player]').forEach(function (video) {
    var shell = video.closest('.video-shell') || document;
    var cover = qs('[data-play-cover]', shell);
    var button = qs('[data-play-button]', shell);
    var stream = video.getAttribute('data-stream');
    var hlsInstance = null;

    function attach() {
      if (video.getAttribute('data-ready') === 'true') {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
      video.setAttribute('data-ready', 'true');
    }

    function start() {
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }
    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        start();
      });
    }
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
