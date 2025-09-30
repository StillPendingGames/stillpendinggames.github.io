// MiniFeaturedVideos.js
// Load YouTube IFrame API once and initialize all featured video containers
(function(){
    // Queue of container elements to initialize once API is ready
    window.__miniFeaturedQueued = window.__miniFeaturedQueued || [];

    // Loader - insert the API script once
    if (!window.__miniFeaturedAPILoaded) {
        window.__miniFeaturedAPILoaded = true;
        var tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Find all featured video containers with data-video-id
    var nodes = document.querySelectorAll('.FeaturedElementVideo[data-video-id]');
    nodes.forEach(function(node){ window.__miniFeaturedQueued.push(node); });

    // This gets called by the YouTube IFrame API when ready
    window.onYouTubeIframeAPIReady = function() {
        window.featuredPlayers = window.featuredPlayers || {};

        while (window.__miniFeaturedQueued && window.__miniFeaturedQueued.length) {
            var container = window.__miniFeaturedQueued.shift();
            try {
                var videoId = container.getAttribute('data-video-id');
                if (!videoId) continue;

                // Give each container a unique id if it doesn't have one
                if (!container.id) container.id = 'miniFeatured_' + Math.random().toString(36).slice(2,9);

                (function(container, videoId){
                    var player = new YT.Player(container, {
                        videoId: videoId,
                        playerVars: {
                            autoplay: 1,
                            controls: 0,
                            playsinline: 1,
                            rel: 0,
                            modestbranding: 1,
                            mute: 1,
                            loop: 1,
                            playlist: videoId
                        },
                        events: {
                            onReady: function(event){
                                try {
                                    event.target.mute();
                                    event.target.playVideo();

                                    var iframe = (event.target.getIframe && event.target.getIframe());
                                    if (iframe) iframe.style.pointerEvents = 'none';

                                    var levels = event.target.getAvailableQualityLevels && event.target.getAvailableQualityLevels();
                                    if (Array.isArray(levels) && levels.length) {
                                        var rank = {"highres":8,"hd2880":7,"hd2160":6,"hd1440":5,"hd1080":4,"hd720":3,"large":2,"medium":1,"small":0};
                                        levels.sort(function(a,b){return (rank[b]||0)-(rank[a]||0)});
                                        var best = levels[0];
                                        try { event.target.setPlaybackQuality(best); } catch(e) { }
                                    } else {
                                        try { event.target.setPlaybackQuality('hd1080'); } catch(e) { }
                                    }
                                } catch(e) { console.warn('player onReady error', e); }
                            },
                            onStateChange: function(event){
                                try {
                                    if (event.data === YT.PlayerState.ENDED) {
                                        event.target.seekTo(0);
                                        event.target.playVideo();
                                    }
                                } catch(e) {}
                            }
                        }
                    });

                    // Store reference
                    window.featuredPlayers[container.id] = player;
                })(container, videoId);

            } catch (e) { console.warn('error creating featured player', e); }
        }
    };
})();
