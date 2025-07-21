import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const VideoPlayer = ({
  videoUrl,
  onStartQuiz,
  unlockThreshold = 0.01, 
  storageKey = 'videoWatchedSegments',
  className = '',
  playerOptions = {},
}) => {
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const [watchedSegments, setWatchedSegments] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);

  // Track watched segments in real-time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateWatchedSegments = () => {
      const currentTime = video.currentTime;

      // Add small segment (last 0.5 seconds) to watched segments
      const segmentStart = Math.max(0, currentTime - 0.5);
      const segmentEnd = Math.min(currentTime, duration);

      setWatchedSegments((prev) => {
        const newSegments = [...prev, [segmentStart, segmentEnd]];
        return mergeSegments(newSegments);
      });
    };

    const interval = setInterval(updateWatchedSegments, 1000);
    return () => clearInterval(interval);
  }, [duration]);

  // Merge overlapping or adjacent segments
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

  // Calculate total watched duration
  const calculateWatchedDuration = () => {
    return watchedSegments.reduce(
      (total, [start, end]) => total + (end - start),
      0
    );
  };

  // Check if quiz should be unlocked
  const isQuizUnlocked = () => {
    if (!duration) return false;
    const watchedDuration = calculateWatchedDuration();
    return watchedDuration >= duration * unlockThreshold;
  };

  // Create progress bar markers
  const renderProgressBarMarkers = () => {
    if (!duration || !progressBarRef.current) return null;

    const progressBar = progressBarRef.current;
    const barWidth = progressBar.offsetWidth;

    return watchedSegments.map(([start, end], index) => {
      const startPercent = (start / duration) * 100;
      const endPercent = (end / duration) * 100;
      const width = endPercent - startPercent;

      return (
        <div
          key={`segment-${index}`}
          className="absolute h-full bg-yellow-400"
          style={{
            left: `${startPercent}%`,
            width: `${width}%`,
          }}
        />
      );
    });
  };

  // Video event handlers
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleError = () => setHasError(true);
  const handleLoadedMetadata = (e) => {
    setDuration(e.target.duration);
    setIsLoading(false);
  };

  const handleQuizClick = () => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
    onStartQuiz();
  };

  // Load/save watched segments from storage
  useEffect(() => {
    try {
      const savedSegments = localStorage.getItem(storageKey);
      if (savedSegments) {
        setWatchedSegments(JSON.parse(savedSegments));
      }
    } catch (error) {
      console.error('Error loading watched segments:', error);
    }

    return () => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(watchedSegments));
      } catch (error) {
        console.error('Error saving watched segments:', error);
      }
    };
  }, [storageKey]);

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="relative">
        {hasError && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <p className="text-red-500 font-medium">
              Error loading video. Please try again later.
            </p>
          </div>
        )}

        {isLoading && !hasError && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading video...</div>
          </div>
        )}

        <video
          ref={videoRef}
          controls
          src={videoUrl}
          onPlay={handlePlay}
          onPause={handlePause}
          onError={handleError}
          onLoadedMetadata={handleLoadedMetadata}
          className={`w-full rounded-t-lg shadow ${hasError ? 'hidden' : ''}`}
          {...playerOptions}
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
