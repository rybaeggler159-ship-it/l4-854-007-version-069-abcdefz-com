(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      function start() {
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }

        start();
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          restart();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
          restart();
        });
      });

      show(0);
      start();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));
      var empty = scope.querySelector('[data-empty-state]');
      var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-chip]'));
      var activeChip = '';

      if (!input || !cards.length) {
        return;
      }

      if (input.getAttribute('data-url-query')) {
        var params = new URLSearchParams(window.location.search);
        var value = params.get(input.getAttribute('data-url-query'));

        if (value) {
          input.value = value;
        }
      }

      function cardText(card) {
        return [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
      }

      function apply() {
        var query = input.value.trim().toLowerCase();
        var shown = false;

        cards.forEach(function (card) {
          var text = cardText(card);
          var ok = (!query || text.indexOf(query) !== -1) && (!activeChip || text.indexOf(activeChip.toLowerCase()) !== -1);
          card.hidden = !ok;

          if (ok) {
            shown = true;
          }
        });

        if (empty) {
          empty.hidden = shown;
        }
      }

      input.addEventListener('input', apply);

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          activeChip = chip.getAttribute('data-chip') || '';

          chips.forEach(function (item) {
            item.classList.toggle('is-active', item === chip);
          });

          apply();
        });
      });

      apply();
    });
  });
})();
