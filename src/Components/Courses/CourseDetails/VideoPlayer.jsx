import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const VideoPlayer = ({
  videoUrl,
  onStartQuiz,
  videoWatched,
  unlockThreshold = 0.01,
  storageKey = 'videoWatchedSegments',
  className = '',
  playerOptions = {},
}) => {
  const playerRef = useRef(null); // Vimeo.Player ou YT.Player instance
  const playerContainerRef = useRef(null);

  const [watchedSegments, setWatchedSegments] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [lastReportedTime, setLastReportedTime] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [youtubePlayStartTime, setYoutubePlayStartTime] = useState(null);

  const isYouTube = (url) => /(?:youtube\.com|youtu\.be)\//i.test(String(url));
  const isVimeo = (url) => /vimeo\.com/i.test(String(url));

  // Extraction des IDs
  const getVimeoId = (url) => {
    const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return m ? m[1] : null;
  };
  const getYouTubeId = (url) => {
    const m = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return m ? m[1] : null;
  };

  // Fusionner segments regardés
  const mergeSegments = (segments) => {
    if (segments.length === 0) return [];
    segments.sort((a, b) => a[0] - b[0]);
    const merged = [segments[0]];
    for (let i = 1; i < segments.length; i++) {
      const last = merged[merged.length - 1];
      const current = segments[i];
      if (current[0] <= last[1]) last[1] = Math.max(last[1], current[1]);
      else merged.push(current);
    }
    return merged;
  };

  // Calcul durée totale regardée
  const calculateWatchedDuration = () =>
    watchedSegments.reduce((total, [start, end]) => total + (end - start), 0);

  // Débloquer quiz ?
  const isQuizUnlocked = () => {
    if (videoWatched) return true;

    // For YouTube videos, auto-unlock after 10 seconds of playing (more lenient)
    if (isYouTube(videoUrl) && isPlaying && duration > 0) {
      const currentTime = playerRef.current?.getCurrentTime?.() || 0;
      if (currentTime >= 10) {
        console.log('YouTube auto-unlock after 10 seconds');
        return true;
      }
    }

    // Alternative: unlock after 15 seconds of continuous playing
    if (isYouTube(videoUrl) && youtubePlayStartTime && isPlaying) {
      const playDuration = (Date.now() - youtubePlayStartTime) / 1000;
      if (playDuration >= 15) {
        console.log('YouTube auto-unlock after 15 seconds of continuous play');
        return true;
      }
    }

    if (!duration) return false;
    const watchedDuration = calculateWatchedDuration();
    const threshold = duration * unlockThreshold;
    const unlocked = watchedDuration >= threshold;

    // Debug logging
    console.log('Quiz unlock check:', {
      videoWatched,
      duration,
      watchedDuration,
      threshold,
      unlocked,
      watchedSegments,
      isYouTube: isYouTube(videoUrl),
      isPlaying,
      currentTime: playerRef.current?.getCurrentTime?.() || 0,
      playDuration: youtubePlayStartTime
        ? (Date.now() - youtubePlayStartTime) / 1000
        : 0,
    });

    return unlocked;
  };

  // Gestion clic quiz
  const handleQuizClick = () => {
    try {
      if (playerRef.current) {
        if (
          isYouTube(videoUrl) &&
          typeof playerRef.current.pauseVideo === 'function'
        ) {
          playerRef.current.pauseVideo();
        } else if (
          isVimeo(videoUrl) &&
          typeof playerRef.current.pause === 'function'
        ) {
          playerRef.current.pause();
        }
      }
    } catch {}
    onStartQuiz();
  };

  // Charger segments sauvegardés
  useEffect(() => {
    try {
      const savedSegments = localStorage.getItem(storageKey);
      if (savedSegments) setWatchedSegments(JSON.parse(savedSegments));
    } catch (e) {
      console.error('Error loading watched segments:', e);
    }
  }, [storageKey]);

  // Sauvegarder segments
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(watchedSegments));
      console.log('Watched segments updated:', watchedSegments);
      // Force re-render to update button state
      setForceUpdate((prev) => prev + 1);
    } catch (e) {
      console.error('Error saving watched segments:', e);
    }
  }, [watchedSegments, storageKey]);

  // Force re-render for YouTube unlock status
  useEffect(() => {
    if (isYouTube(videoUrl) && isPlaying) {
      const interval = setInterval(() => {
        setForceUpdate((prev) => prev + 1);
      }, 2000); // Check every 2 seconds

      return () => clearInterval(interval);
    }
  }, [isYouTube, videoUrl, isPlaying]);

  // Initialisation Vimeo Player
  const initVimeoPlayer = async (id) => {
    if (!window.Vimeo || !window.Vimeo.Player) {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://player.vimeo.com/api/player.js';
        script.async = true;
        script.onload = resolve;
        document.body.appendChild(script);
      });
    }

    const player = new window.Vimeo.Player(playerContainerRef.current, {
      id,
      dnt: true,
      title: false,
      byline: false,
      portrait: false,
      ...playerOptions.vimeo,
    });
    playerRef.current = player;

    player.on('loaded', () => {
      setIsLoading(false);
      player.getDuration().then((d) => setDuration(d || 0));
    });

    player.on('play', () => setIsPlaying(true));
    player.on('pause', () => setIsPlaying(false));

    player.on('timeupdate', (data) => {
      const playedSeconds = data.seconds || 0;
      const delta = Math.abs(playedSeconds - lastReportedTime);
      if (delta < 0.75) return;
      setLastReportedTime(playedSeconds);
      const segmentStart = Math.max(0, playedSeconds - 0.5);
      const segmentEnd = Math.min(playedSeconds, duration || playedSeconds);
      setWatchedSegments((prev) =>
        mergeSegments([...prev, [segmentStart, segmentEnd]])
      );
    });

    player.on('error', () => {
      setHasError(true);
      setIsLoading(false);
    });
  };

  // Initialisation YouTube Player
  const initYouTubePlayer = (videoId) => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API ready, creating player...');
        createYTPlayer(videoId);
      };
    } else {
      console.log('YouTube API already loaded, creating player...');
      createYTPlayer(videoId);
    }
  };

  // Création player YouTube
  const createYTPlayer = (videoId) => {
    const player = new window.YT.Player(playerContainerRef.current, {
      videoId,
      playerVars: {
        modestbranding: 1,
        rel: 0,
        origin: window.location.origin,
        enablejsapi: 1,
        ...playerOptions.youtube,
      },
      events: {
        onReady: (event) => {
          setIsLoading(false);
          const duration = event.target.getDuration();
          setDuration(duration || 0);
          console.log('YouTube player ready, duration:', duration);
        },
        onStateChange: (event) => {
          console.log('YouTube state change:', event.data);
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            setYoutubePlayStartTime(Date.now());
            trackTimeYT(event.target);
          } else if (
            event.data === window.YT.PlayerState.PAUSED ||
            event.data === window.YT.PlayerState.ENDED
          ) {
            setIsPlaying(false);
            setYoutubePlayStartTime(null);
          }
        },
        onError: (event) => {
          console.error('YouTube player error:', event);
          setHasError(true);
          setIsLoading(false);
        },
      },
    });
    playerRef.current = player;
  };

  // Tracking temps YouTube par polling
  const trackTimeYT = (player) => {
    const interval = setInterval(() => {
      if (!player || !isPlaying) {
        clearInterval(interval);
        return;
      }
      try {
        const playedSeconds = player.getCurrentTime();
        if (playedSeconds && playedSeconds > 0) {
          const delta = Math.abs(playedSeconds - lastReportedTime);
          if (delta >= 0.5) {
            setLastReportedTime(playedSeconds);
            const segmentStart = Math.max(0, playedSeconds - 0.5);
            const segmentEnd = Math.min(
              playedSeconds,
              duration || playedSeconds
            );
            setWatchedSegments((prev) =>
              mergeSegments([...prev, [segmentStart, segmentEnd]])
            );
          }
        }
      } catch (error) {
        console.error('Error tracking YouTube time:', error);
      }
    }, 1000);
  };

  // Effet d'initialisation player
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    setDuration(0);
    setLastReportedTime(0);
    setWatchedSegments([]);

    if (isYouTube(videoUrl)) {
      const videoId = getYouTubeId(videoUrl);
      if (!videoId) {
        setHasError(true);
        setIsLoading(false);
        return;
      }
      initYouTubePlayer(videoId);
    } else if (isVimeo(videoUrl)) {
      const videoId = getVimeoId(videoUrl);
      if (!videoId) {
        setHasError(true);
        setIsLoading(false);
        return;
      }
      initVimeoPlayer(videoId);
    } else {
      setHasError(true);
      setIsLoading(false);
    }

    return () => {
      if (playerRef.current) {
        if (isYouTube(videoUrl)) {
          playerRef.current.destroy();
        } else if (isVimeo(videoUrl)) {
          playerRef.current.unload?.();
        }
        playerRef.current = null;
      }
    };
  }, [videoUrl]);
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="relative w-full aspect-video overflow-hidden">
        {hasError && (
          <div
            className="absolute inset-0 bg-gray-100 flex items-center justify-center z-20"
            style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
          >
            <p className="text-red-500 font-medium">
              Error loading video. Please try again later.
            </p>
          </div>
        )}

        {isLoading && !hasError && (
          <div
            className="absolute inset-0 bg-gray-100 flex items-center justify-center z-20"
            style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
          >
            <div className="animate-pulse text-gray-400">Loading video...</div>
          </div>
        )}

        {/* Player container, relative with absolute iframe inside */}
        <div
          ref={playerContainerRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 10,
            backgroundColor: 'black',
          }}
        />
      </div>

      <div className="flex justify-end mt-4">
        <button
          key={`quiz-button-${forceUpdate}`}
          disabled={!isQuizUnlocked()}
          onClick={handleQuizClick}
          className={`px-6 py-2 rounded font-semibold transition-colors duration-300 ${
            isQuizUnlocked()
              ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              : 'bg-gray-400 text-gray-700 cursor-not-allowed'
          }`}
          aria-label={isQuizUnlocked() ? 'Start quiz' : 'Quiz locked'}
        >
          {isQuizUnlocked()
            ? 'Start Quiz Now'
            : 'Continue Watching to Unlock Quiz'}
        </button>
      </div>
    </div>
  );
};

VideoPlayer.propTypes = {
  videoUrl: PropTypes.string.isRequired,
  onStartQuiz: PropTypes.func.isRequired,
  unlockThreshold: PropTypes.number,
  storageKey: PropTypes.string,
  className: PropTypes.string,
  playerOptions: PropTypes.object,
};

export default VideoPlayer;
