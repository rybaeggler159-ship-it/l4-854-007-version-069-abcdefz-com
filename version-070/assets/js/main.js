(function() {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function() {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero-slider]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const next = hero.querySelector('[data-hero-next]');
    const prev = hero.querySelector('[data-hero-prev]');
    let current = 0;
    let timer = null;

    const show = function(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const start = function() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5200);
    };

    if (next) {
      next.addEventListener('click', function() {
        show(current + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', function() {
        show(current - 1);
        start();
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  const filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    const keyword = filterPanel.querySelector('[data-filter-keyword]');
    const year = filterPanel.querySelector('[data-filter-year]');
    const type = filterPanel.querySelector('[data-filter-type]');
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    const empty = document.querySelector('[data-no-results]');

    const apply = function() {
      const q = keyword ? keyword.value.trim().toLowerCase() : '';
      const y = year ? year.value : '';
      const t = type ? type.value : '';
      let visible = 0;

      cards.forEach(function(card) {
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        const region = (card.getAttribute('data-region') || '').toLowerCase();
        const cardYear = card.getAttribute('data-year') || '';
        const cardType = card.getAttribute('data-type') || '';
        const matchKeyword = !q || title.includes(q) || region.includes(q);
        const matchYear = !y || cardYear === y;
        const matchType = !t || cardType === t;
        const ok = matchKeyword && matchYear && matchType;

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    [keyword, year, type].forEach(function(control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  const searchResults = document.querySelector('[data-search-results]');

  if (searchResults && Array.isArray(window.searchMovies)) {
    const params = new URLSearchParams(window.location.search);
    const q = (params.get('q') || '').trim();
    const input = document.querySelector('[data-search-input]');
    const summary = document.querySelector('[data-search-summary]');

    if (input) {
      input.value = q;
    }

    const normalized = q.toLowerCase();
    const items = window.searchMovies.filter(function(item) {
      if (!normalized) {
        return item.rank <= 24;
      }

      return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ').toLowerCase().includes(normalized);
    }).slice(0, 120);

    if (summary) {
      summary.textContent = q ? '与“' + q + '”相关的影片' : '精选推荐影片';
    }

    if (!items.length) {
      searchResults.innerHTML = '<div class="no-results is-visible">没有找到匹配影片，换个关键词试试。</div>';
      return;
    }

    searchResults.innerHTML = items.map(function(item) {
      const tags = item.tags.split(' ').filter(Boolean).slice(0, 4).map(function(tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<article class="search-result-card">'
        + '<a class="search-result-poster" href="' + escapeAttribute(item.url) + '">'
        + '<img src="' + escapeAttribute(item.cover) + '" alt="' + escapeAttribute(item.title) + '" loading="lazy">'
        + '</a>'
        + '<div>'
        + '<div class="movie-tags">' + tags + '</div>'
        + '<h3><a href="' + escapeAttribute(item.url) + '">' + escapeHtml(item.title) + '</a></h3>'
        + '<p>' + escapeHtml(item.oneLine) + '</p>'
        + '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span></div>'
        + '</div>'
        + '</article>';
    }).join('');
  }
})();

function initMoviePlayer(sourceUrl) {
  const video = document.getElementById('movie-video');
  const overlay = document.querySelector('[data-play-overlay]');
  const status = document.querySelector('[data-play-status]');
  let hls = null;
  let ready = false;

  if (!video || !sourceUrl) {
    return;
  }

  const setStatus = function(message) {
    if (status) {
      status.textContent = message || '';
    }
  };

  const prepare = function() {
    if (ready) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function(event, data) {
        if (data && data.fatal) {
          setStatus('播放加载失败，请刷新重试。');
        }
      });
      ready = true;
      return;
    }

    video.src = sourceUrl;
    ready = true;
  };

  const play = function() {
    prepare();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    const promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function() {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
        setStatus('点击播放器开始播放。');
      });
    }
  };

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  video.addEventListener('click', function() {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    setStatus('');
  });

  video.addEventListener('pause', function() {
    if (video.currentTime === 0 && overlay) {
      overlay.classList.remove('is-hidden');
    }
  });

  video.addEventListener('error', function() {
    setStatus('播放加载失败，请刷新重试。');
  });

  window.addEventListener('beforeunload', function() {
    if (hls) {
      hls.destroy();
    }
  });
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"]/g, function(character) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[character];
  });
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/'/g, '&#39;');
}
