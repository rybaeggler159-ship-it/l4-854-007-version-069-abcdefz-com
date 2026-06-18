(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');
  if (backTop) {
    var syncBackTop = function () {
      if (window.scrollY > 360) {
        backTop.classList.add('show');
      } else {
        backTop.classList.remove('show');
      }
    };
    window.addEventListener('scroll', syncBackTop, { passive: true });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    syncBackTop();
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var showSlide = function (index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-card-search]');
  var categoryFilter = document.querySelector('[data-category-filter]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var list = document.querySelector('[data-card-list]');
  if (list && (searchInput || categoryFilter || yearFilter)) {
    var items = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .rank-item'));
    var normalize = function (value) {
      return String(value || '').toLowerCase().trim();
    };
    var applyFilter = function () {
      var keyword = normalize(searchInput && searchInput.value);
      var category = categoryFilter ? categoryFilter.value : '';
      var year = yearFilter ? yearFilter.value : '';
      items.forEach(function (item) {
        var haystack = normalize(item.getAttribute('data-search'));
        var itemCategory = item.getAttribute('data-category') || '';
        var itemYear = item.getAttribute('data-year') || '';
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okCategory = !category || itemCategory === category;
        var okYear = !year || itemYear === year;
        item.classList.toggle('is-hidden', !(okKeyword && okCategory && okYear));
      });
    };
    if (searchInput) searchInput.addEventListener('input', applyFilter);
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilter);
    if (yearFilter) yearFilter.addEventListener('change', applyFilter);
  }
})();
