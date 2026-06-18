function initMoviePlayer(videoUrl) {
  var video = document.getElementById("movieVideo");
  var cover = document.getElementById("playerCover");
  var hasBound = false;
  var hlsInstance = null;

  if (!video || !cover || !videoUrl) {
    return;
  }

  function attachVideo() {
    if (hasBound) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(videoUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = videoUrl;
    }

    video.controls = true;
    hasBound = true;
  }

  function startPlayback() {
    attachVideo();
    cover.classList.add("is-hidden");

    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  cover.addEventListener("click", startPlayback);
  video.addEventListener("click", function () {
    if (!hasBound) {
      startPlayback();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
