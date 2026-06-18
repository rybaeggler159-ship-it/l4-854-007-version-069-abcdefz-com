(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var navToggle = document.querySelector(".nav-toggle");
    var navLinks = document.querySelector(".nav-links");

    if (navToggle && navLinks) {
      navToggle.addEventListener("click", function () {
        navLinks.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var currentSlide = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      currentSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === currentSlide);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === currentSlide);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-slide") || 0);
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5200);
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll(".filter-input"));
    filterInputs.forEach(function (input) {
      input.addEventListener("input", function () {
        var root = input.closest("main") || document;
        var cards = Array.prototype.slice.call(root.querySelectorAll(".filter-list .movie-card"));
        var query = input.value.trim().toLowerCase();

        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          card.classList.toggle("hide-card", query && haystack.indexOf(query) === -1);
        });
      });
    });
  });
})();
