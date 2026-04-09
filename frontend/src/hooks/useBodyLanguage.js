import { useState, useEffect, useRef } from 'react';

const FaceMesh = window.FaceMesh;
const Camera = window.Camera;

export const useBodyLanguage = (videoRef) => {
  const [confidenceScore, setConfidenceScore] = useState(8.0);
  const [issues, setIssues] = useState([]);
  
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;

    faceMeshRef.current = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMeshRef.current.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMeshRef.current.onResults((results) => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        // Very basic mock logic for eye contact based on face center
        // Real logic would calculate vector angles between irises and camera
        const landmarks = results.multiFaceLandmarks[0];
        
        // Nose tip is landmark 1
        const nose = landmarks[1];
        
        let newScore = 9.0;
        let currentIssues = [];

        // Check if looking too far left/right
        if (nose.x < 0.35 || nose.x > 0.65) {
           newScore -= 1.5;
           currentIssues.push("Looking away");
        }
        
        // Check if looking down or up
        if (nose.y > 0.65) {
           newScore -= 1.0;
           if(!currentIssues.includes("Looking away")) currentIssues.push("Looking down");
        } else if (nose.y < 0.35) {
           newScore -= 1.0;
           if(!currentIssues.includes("Looking away")) currentIssues.push("Looking up");
        }

        // Smooth score changes
        setConfidenceScore(prev => +(prev * 0.9 + newScore * 0.1).toFixed(1));
        setIssues(currentIssues);
      } else {
         setConfidenceScore(prev => +(prev * 0.9 + 5.0 * 0.1).toFixed(1));
         setIssues(["Face not visible"]);
      }
    });

    cameraRef.current = new Camera(videoRef.current, {
      onFrame: async () => {
        if (faceMeshRef.current && videoRef.current) {
          await faceMeshRef.current.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480
    });

    try {
      cameraRef.current.start();
    } catch (e) {
      console.error("Camera permissions denied or unavailable", e);
    }

    return () => {
      cameraRef.current?.stop();
    };
  }, [videoRef]);

  return { confidenceScore, issues };
};
