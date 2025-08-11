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
  const playerRef = useRef(null); // Vimeo.Player instance
  const vimeoContainerRef = useRef(null);
  const [watchedSegments, setWatchedSegments] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [lastReportedTime, setLastReportedTime] = useState(0);

  useEffect(() => {
    console.log('VideoPlayer mounted, videoUrl:', videoUrl);
    return () => console.log('VideoPlayer unmounted');
  }, [videoUrl]);

  // Fusionner segments chevauchants ou adjacents
  const mergeSegments = (segments) => {
    if (segments.length === 0) return [];
    segments.sort((a, b) => a[0] - b[0]);
    const merged = [segments[0]];
    for (let i = 1; i < segments.length; i++) {
      const last = merged[merged.length - 1];
      const current = segments[i];
      if (current[0] <= last[1]) {
        last[1] = Math.max(last[1], current[1]);
      } else {
        merged.push(current);
      }
    }
    return merged;
  };

  // Calcul durée totale regardée
  const calculateWatchedDuration = () => {
    return watchedSegments.reduce(
      (total, [start, end]) => total + (end - start),
      0
    );
  };

  // Vérifier si quiz débloqué
  const isQuizUnlocked = () => {
    if (videoWatched) return true;
    if (!duration) return false;
    const watchedDuration = calculateWatchedDuration();
    return watchedDuration >= duration * unlockThreshold;
  };

  // Gestion événements ReactPlayer
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };
  const handleReady = () => setIsLoading(false);
  const handleDuration = (dur) => setDuration(dur || 0);

  const handleQuizClick = () => {
    try {
      if (playerRef.current && typeof playerRef.current.pause === 'function') {
        playerRef.current.pause();
      }
    } catch {}
    onStartQuiz();
  };

  // Charger segments sauvegardés
  useEffect(() => {
    try {
      const savedSegments = localStorage.getItem(storageKey);
      if (savedSegments) {
        setWatchedSegments(JSON.parse(savedSegments));
      }
    } catch (error) {
      console.error('Error loading watched segments:', error);
    }
  }, [storageKey]);

  // Sauvegarder segments regardés
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(watchedSegments));
    } catch (error) {
      console.error('Error saving watched segments:', error);
    }
  }, [watchedSegments, storageKey]);

  // Extract Vimeo ID from common URL forms
  const getVimeoId = (url) => {
    if (!url) return null;
    const s = String(url).trim();
    // Matches player.vimeo.com/video/ID or vimeo.com/ID
    const m = s.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return m ? m[1] : null;
  };

  // Ensure Vimeo Player SDK is loaded and initialize the player
  useEffect(() => {
    const id = getVimeoId(videoUrl);
    if (!id) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    let player;

    const loadVimeoScript = () =>
      new Promise((resolve) => {
        if (window.Vimeo && window.Vimeo.Player) return resolve();
        const existing = document.querySelector('script[data-vimeo-player]');
        if (existing) {
          existing.addEventListener('load', () => resolve());
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://player.vimeo.com/api/player.js';
        script.async = true;
        script.dataset.vimeoPlayer = 'true';
        script.onload = () => resolve();
        document.body.appendChild(script);
      });

    const init = async () => {
      try {
        await loadVimeoScript();
        if (cancelled || !vimeoContainerRef.current) return;
        player = new window.Vimeo.Player(vimeoContainerRef.current, {
          id,
          dnt: true,
          title: false,
          byline: false,
          portrait: false,
        });
        playerRef.current = player;

        player.on('loaded', () => {
          if (cancelled) return;
          setIsLoading(false);
          player.getDuration().then((d) => setDuration(d || 0));
        });
        player.on('play', () => {
          if (cancelled) return;
          handlePlay();
        });
        player.on('pause', () => {
          if (cancelled) return;
          handlePause();
        });
        player.on('timeupdate', (data) => {
          if (cancelled) return;
          const playedSeconds = data?.seconds ?? 0;
          const delta = Math.abs(playedSeconds - lastReportedTime);
          if (delta < 0.75) return;
          setLastReportedTime(playedSeconds);
          const segmentStart = Math.max(0, playedSeconds - 0.5);
          const segmentEnd = Math.min(playedSeconds, duration || playedSeconds);
          setWatchedSegments((prev) => {
            const newSegments = [...prev, [segmentStart, segmentEnd]];
            return mergeSegments(newSegments);
          });
        });
        player.on('error', () => {
          if (cancelled) return;
          setHasError(true);
          setIsLoading(false);
        });
      } catch (e) {
        if (cancelled) return;
        setHasError(true);
        setIsLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
      try {
        if (player) player.unload?.();
      } catch {}
      playerRef.current = null;
    };
    // **IMPORTANT** : ne dépend que de videoUrl ici
  }, [videoUrl]);

  return (
    <div className={`flex flex-col ${className}`}>
      <div
        style={{ position: 'relative', paddingTop: '56.25%', width: '100%' }}
      >
        {hasError && (
          <div
            className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10"
            style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
          >
            <p className="text-red-500 font-medium">
              Error loading video. Please try again later.
            </p>
          </div>
        )}

        {isLoading && !hasError && (
          <div
            className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10"
            style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
          >
            <div className="animate-pulse text-gray-400">Loading video...</div>
          </div>
        )}

        <div
          ref={vimeoContainerRef}
          style={{ position: 'absolute', inset: 0 }}
        />
      </div>

      <div className="flex justify-end mt-4">
        <button
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
