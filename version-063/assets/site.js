document.addEventListener("DOMContentLoaded", function () {
  initializeMenu();
  initializeHeroCarousel();
  initializeArchiveFilters();
  initializeSearchPage();
  initializePlayer();
});

function initializeMenu() {
  var toggle = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-mobile-nav]");

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", function () {
    nav.classList.toggle("open");
  });
}

function initializeHeroCarousel() {
  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var panelTitle = document.querySelector("[data-hero-title]");
  var panelText = document.querySelector("[data-hero-text]");
  var panelLink = document.querySelector("[data-hero-link]");
  var panelImage = document.querySelector("[data-hero-image]");
  var index = 0;

  if (!slides.length) {
    return;
  }

  function showSlide(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === index);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === index);
    });

    var activeSlide = slides[index];

    if (panelTitle) {
      panelTitle.textContent = activeSlide.getAttribute("data-title") || "";
    }

    if (panelText) {
      panelText.textContent = activeSlide.getAttribute("data-text") || "";
    }

    if (panelLink) {
      panelLink.setAttribute("href", activeSlide.getAttribute("data-link") || "#");
    }

    if (panelImage) {
      panelImage.setAttribute("src", activeSlide.getAttribute("data-image") || panelImage.getAttribute("src"));
      panelImage.setAttribute("alt", (activeSlide.getAttribute("data-title") || "焦点影片") + "推荐海报");
    }
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      showSlide(dotIndex);
    });
  });

  showSlide(0);

  window.setInterval(function () {
    showSlide(index + 1);
  }, 5600);
}

function initializeArchiveFilters() {
  var filterRoots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));

  filterRoots.forEach(function (root) {
    var keywordInput = root.querySelector("[data-filter-keyword]");
    var yearSelect = root.querySelector("[data-filter-year]");
    var regionSelect = root.querySelector("[data-filter-region]");
    var typeSelect = root.querySelector("[data-filter-type]");
    var genreSelect = root.querySelector("[data-filter-genre]");
    var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
    var counter = root.querySelector("[data-result-count]");
    var empty = root.querySelector("[data-empty-state]");

    function matches(card) {
      var keyword = (keywordInput && keywordInput.value || "").trim().toLowerCase();
      var year = yearSelect && yearSelect.value || "";
      var region = regionSelect && regionSelect.value || "";
      var type = typeSelect && typeSelect.value || "";
      var genre = genreSelect && genreSelect.value || "";
      var haystack = [
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" ").toLowerCase();

      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }

      if (year && card.getAttribute("data-year") !== year) {
        return false;
      }

      if (region && card.getAttribute("data-region") !== region) {
        return false;
      }

      if (type && card.getAttribute("data-type") !== type) {
        return false;
      }

      if (genre && (card.getAttribute("data-genre") || "").indexOf(genre) === -1) {
        return false;
      }

      return true;
    }

    function applyFilter() {
      var visible = 0;

      cards.forEach(function (card) {
        var ok = matches(card);
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });

      if (counter) {
        counter.textContent = String(visible);
      }

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    [keywordInput, yearSelect, regionSelect, typeSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  });
}

function initializeSearchPage() {
  var root = document.querySelector("[data-search-root]");

  if (!root || !window.MOVIE_DATA) {
    return;
  }

  var keywordInput = root.querySelector("[data-search-keyword]");
  var genreSelect = root.querySelector("[data-search-genre]");
  var yearSelect = root.querySelector("[data-search-year]");
  var regionSelect = root.querySelector("[data-search-region]");
  var typeSelect = root.querySelector("[data-search-type]");
  var resultGrid = root.querySelector("[data-search-results]");
  var counter = root.querySelector("[data-search-count]");
  var params = new URLSearchParams(window.location.search);

  if (keywordInput && params.get("q")) {
    keywordInput.value = params.get("q");
  }

  if (genreSelect && params.get("genre")) {
    genreSelect.value = params.get("genre");
  }

  if (yearSelect && params.get("year")) {
    yearSelect.value = params.get("year");
  }

  if (regionSelect && params.get("region")) {
    regionSelect.value = params.get("region");
  }

  if (typeSelect && params.get("type")) {
    typeSelect.value = params.get("type");
  }

  function cardTemplate(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class="movie-card">",
      "  <a class="poster-link" href="movies/movie-" + movie.id + ".html" aria-label="观看" + escapeHtml(movie.title) + "">",
      "    <img src="" + movie.cover + "" alt="" + escapeHtml(movie.title) + "海报" loading="lazy">",
      "    <span class="poster-shade"></span>",
      "    <span class="score-badge">热度 " + escapeHtml(movie.heat) + "</span>",
      "    <span class="play-badge">播放</span>",
      "  </a>",
      "  <div class="movie-card-body">",
      "    <h3><a href="movies/movie-" + movie.id + ".html">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p class="movie-meta">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</p>",
      "    <p class="movie-desc">" + escapeHtml(movie.oneLine) + "</p>",
      "    <div class="tag-row">" + tags + "</div>",
      "  </div>",
      "</article>"
    ].join("
");
  }

  function applySearch() {
    var keyword = (keywordInput && keywordInput.value || "").trim().toLowerCase();
    var genre = genreSelect && genreSelect.value || "";
    var year = yearSelect && yearSelect.value || "";
    var region = regionSelect && regionSelect.value || "";
    var type = typeSelect && typeSelect.value || "";

    var results = window.MOVIE_DATA.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.tags.join(" "),
        movie.oneLine
      ].join(" ").toLowerCase();

      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }

      if (genre && movie.genres.indexOf(genre) === -1) {
        return false;
      }

      if (year && movie.year !== year) {
        return false;
      }

      if (region && movie.region !== region) {
        return false;
      }

      if (type && movie.type !== type) {
        return false;
      }

      return true;
    });

    var limited = results.slice(0, 120);

    if (counter) {
      counter.textContent = String(results.length);
    }

    if (resultGrid) {
      resultGrid.innerHTML = limited.map(cardTemplate).join("
");
    }
  }

  [keywordInput, genreSelect, yearSelect, regionSelect, typeSelect].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applySearch);
      control.addEventListener("change", applySearch);
    }
  });

  applySearch();
}

function initializePlayer() {
  var video = document.querySelector("[data-hls-src]");
  var cover = document.querySelector("[data-player-cover]");
  var button = document.querySelector("[data-play-button]");
  var message = document.querySelector("[data-player-message]");

  if (!video || !button) {
    return;
  }

  function setMessage(text) {
    if (message) {
      message.textContent = text;
    }
  }

  function playVideo() {
    var source = video.getAttribute("data-hls-src");

    if (!source) {
      setMessage("暂无可用播放源。");
      return;
    }

    if (cover) {
      cover.classList.add("hidden");
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.play().catch(function () {
        setMessage("浏览器已拦截自动播放，请再次点击视频播放。");
      });
      setMessage("正在使用浏览器原生 HLS 播放。");
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {
          setMessage("播放源已加载，请点击视频继续播放。");
        });
      });
      hls.on(window.Hls.Events.ERROR, function () {
        setMessage("播放连接暂时不可用，请刷新后重试。");
      });
      setMessage("正在初始化 HLS 播放源。");
      return;
    }

    setMessage("当前浏览器不支持 HLS 播放，请更换浏览器或使用 Safari 访问。");
  }

  button.addEventListener("click", playVideo);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
