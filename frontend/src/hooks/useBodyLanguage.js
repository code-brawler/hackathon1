import { useState, useEffect, useRef } from 'react';

const FaceMesh = window.FaceMesh;
const Camera = window.Camera;

export const useBodyLanguage = (videoRef) => {
  const [confidenceScore, setConfidenceScore] = useState(8.0);
  const [issues, setIssues] = useState([]);
  
  const [motionViolations, setMotionViolations] = useState(0);
  const [multiFaceViolations, setMultiFaceViolations] = useState(0);
  
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);
  const lastNosePosRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;

    faceMeshRef.current = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMeshRef.current.setOptions({
      maxNumFaces: 5,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMeshRef.current.onResults((results) => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        const nose = landmarks[1];
        
        let newScore = 9.0;
        let currentIssues = [];

        // 1. Multi-Face Proctoring Detection Filter
        if (results.multiFaceLandmarks.length > 1) {
            setMultiFaceViolations(prev => prev + 1);
            currentIssues.push("Multiple individuals detected");
            newScore -= 3.0; // Heavy penalty
        }

        // 2. High Velocity Motion Detection Filter
        if (lastNosePosRef.current) {
            const dx = nose.x - lastNosePosRef.current.x;
            const dy = nose.y - lastNosePosRef.current.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            // Normalized Euclidean threshold bounds mapped strictly for rapid twitching/movement
            if (dist > 0.04) {
                setMotionViolations(prev => prev + 1);
                if (!currentIssues.includes("Excessive movement")) currentIssues.push("Excessive movement");
                newScore -= 2.0;
            }
        }
        lastNosePosRef.current = { x: nose.x, y: nose.y };
        
        // 3. Vector Center Gaze Bounds 
        if (nose.x < 0.35 || nose.x > 0.65) {
           newScore -= 1.5;
           currentIssues.push("Off-screen contact");
        }
        if (nose.y > 0.65) {
           newScore -= 1.0;
           if(!currentIssues.includes("Off-screen contact")) currentIssues.push("Looking down");
        } else if (nose.y < 0.35) {
           newScore -= 1.0;
           if(!currentIssues.includes("Off-screen contact")) currentIssues.push("Looking up");
        }

        // Smooth physical confidence vectors
        setConfidenceScore(prev => +(prev * 0.9 + newScore * 0.1).toFixed(1));
        setIssues(currentIssues);
      } else {
         setConfidenceScore(prev => +(prev * 0.9 + 5.0 * 0.1).toFixed(1));
         setIssues(["Connection lost. Face hidden."]);
         lastNosePosRef.current = null;
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

  return { confidenceScore, issues, motionViolations, multiFaceViolations };
};
