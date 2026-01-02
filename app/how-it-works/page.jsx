"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./how-it-works.module.css";

export default function HowItWorksPage() {
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = 1;
    v.loop = true;
  }, []);

  return (
    <main className={styles.container}>
      <div className={styles.theatre}>
        <div className={styles.curtainLeft} aria-hidden="true" />
        <div className={styles.curtainRight} aria-hidden="true" />

        <div className={styles.spotlight} aria-hidden="true" />

        <div className={styles.stage}>
          <div className={styles.videoWrapper}>
            <video
              ref={videoRef}
              src="/working.mp4"
              className={styles.video}
              playsInline
              autoPlay
              loop
              onClick={togglePlay}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onContextMenu={(e) => e.preventDefault()}
            >
              Your browser does not support the video tag.
            </video>

            <div className={styles.controls}>
              <input
                className={styles.seek}
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                value={currentTime}
                aria-label="Seek"
                onChange={(e) => {
                  const t = Number(e.target.value);
                  setCurrentTime(t);
                  if (videoRef.current) videoRef.current.currentTime = t;
                }}
              />
            </div>
          </div>
        </div>

        <div className={styles.floor} aria-hidden="true" />
      </div>
    </main>
  );
}
