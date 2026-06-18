import { H as Hls } from "./video-player-dru42stk.js";

const ready = (callback) => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
        callback();
    }
};

function initNavigation() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const menu = document.querySelector("[data-mobile-nav]");

    if (!toggle || !menu) {
        return;
    }

    toggle.addEventListener("click", () => {
        menu.classList.toggle("is-open");
    });
}

function initHero() {
    const hero = document.querySelector("[data-hero]");

    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const previous = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    const show = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    };

    const restart = () => {
        window.clearInterval(timer);
        timer = window.setInterval(() => show(current + 1), 5000);
    };

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            show(index);
            restart();
        });
    });

    previous?.addEventListener("click", () => {
        show(current - 1);
        restart();
    });

    next?.addEventListener("click", () => {
        show(current + 1);
        restart();
    });

    if (slides.length > 1) {
        restart();
    }
}

function initFilters() {
    const input = document.querySelector("[data-filter-input]");
    const cards = Array.from(document.querySelectorAll(".js-movie-card"));
    const count = document.querySelector("[data-filter-count]");
    const empty = document.querySelector("[data-empty-state]");
    const yearButtons = Array.from(document.querySelectorAll("[data-year-filter]"));
    const categoryButtons = Array.from(document.querySelectorAll("[data-category-filter]"));

    if (!input && yearButtons.length === 0 && categoryButtons.length === 0) {
        return;
    }

    let activeYear = "all";
    let activeCategory = "all";

    const apply = () => {
        const keyword = (input?.value || "").trim().toLowerCase();
        let visible = 0;

        cards.forEach((card) => {
            const searchText = (card.dataset.search || card.textContent || "").toLowerCase();
            const year = card.dataset.year || "";
            const category = card.dataset.category || "";
            const matchesKeyword = !keyword || searchText.includes(keyword);
            const matchesYear = activeYear === "all" || year === activeYear;
            const matchesCategory = activeCategory === "all" || category === activeCategory;
            const shouldShow = matchesKeyword && matchesYear && matchesCategory;

            card.hidden = !shouldShow;
            if (shouldShow) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = String(visible);
        }

        if (empty) {
            empty.hidden = visible !== 0;
        }
    };

    input?.addEventListener("input", apply);

    yearButtons.forEach((button) => {
        button.addEventListener("click", () => {
            activeYear = button.dataset.yearFilter || "all";
            yearButtons.forEach((item) => item.classList.toggle("active", item === button));
            apply();
        });
    });

    categoryButtons.forEach((button) => {
        button.addEventListener("click", () => {
            activeCategory = button.dataset.categoryFilter || "all";
            categoryButtons.forEach((item) => item.classList.toggle("active", item === button));
            apply();
        });
    });

    apply();
}

function initPlayers() {
    const players = Array.from(document.querySelectorAll("[data-player]"));

    players.forEach((player) => {
        const video = player.querySelector("video");
        const start = player.querySelector("[data-player-start]");
        const status = player.querySelector("[data-player-status]");
        const source = player.dataset.src;
        let hls = null;
        let prepared = false;

        if (!video || !source) {
            if (status) {
                status.textContent = "未找到播放源";
            }
            return;
        }

        const setStatus = (message) => {
            if (status) {
                status.textContent = message;
            }
        };

        const prepare = () => {
            if (prepared) {
                return;
            }

            prepared = true;
            setStatus("正在初始化 HLS 播放源…");
            video.controls = true;

            if (Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });

                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    setStatus("播放源已就绪");
                });
                hls.on(Hls.Events.ERROR, (_event, data) => {
                    if (data && data.fatal) {
                        setStatus("视频加载失败，请稍后重试");
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                setStatus("播放源已就绪");
            } else {
                setStatus("当前浏览器不支持 HLS 播放");
            }
        };

        const play = async () => {
            prepare();

            try {
                await video.play();
                player.classList.add("is-playing");
                setStatus("正在播放");
            } catch (error) {
                setStatus("请再次点击播放");
            }
        };

        start?.addEventListener("click", (event) => {
            event.preventDefault();
            play();
        });

        video.addEventListener("click", () => {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener("play", () => {
            player.classList.add("is-playing");
            setStatus("正在播放");
        });

        video.addEventListener("pause", () => {
            player.classList.remove("is-playing");
            setStatus("已暂停");
        });

        window.addEventListener("pagehide", () => {
            if (hls) {
                hls.destroy();
            }
        });
    });
}

ready(() => {
    initNavigation();
    initHero();
    initFilters();
    initPlayers();
});
