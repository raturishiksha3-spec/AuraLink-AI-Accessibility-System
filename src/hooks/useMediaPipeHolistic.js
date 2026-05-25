import { useCallback, useEffect, useRef, useState } from "react";
import { Holistic } from "@mediapipe/holistic";

export function useMediaPipeHolistic({ enabled = true } = {}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const holisticRef = useRef(null);
  const previewRafRef = useRef(0);
  const processRafRef = useRef(0);
  const processingRef = useRef(false);
  const lastProcessRef = useRef(0);
  const [results, setResults] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const drawVideoFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || video.readyState < 2) return;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);
  }, []);

  const drawResults = useCallback(
    (holisticResults) => {
      drawVideoFrame();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.fillStyle = "rgba(20, 184, 166, 0.95)";
      [...(holisticResults.leftHandLandmarks ?? []), ...(holisticResults.rightHandLandmarks ?? [])].forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x * canvas.width, point.y * canvas.height, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    },
    [drawVideoFrame]
  );

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;

    async function start() {
      try {
        setStatus("opening camera");
        setError("");
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera access is not available in this browser.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 24, max: 30 },
            facingMode: "user"
          },
          audio: false
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          await videoRef.current.play();
        }

        setStatus("camera ready");

        const previewLoop = () => {
          drawVideoFrame();
          previewRafRef.current = window.requestAnimationFrame(previewLoop);
        };
        previewLoop();

        window.setTimeout(async () => {
          if (cancelled) return;
          try {
            setStatus("tracking loading");
            const holistic = new Holistic({
              locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
            });
            holistic.setOptions({
              modelComplexity: 0,
              smoothLandmarks: true,
              enableSegmentation: false,
              refineFaceLandmarks: false,
              minDetectionConfidence: 0.45,
              minTrackingConfidence: 0.45
            });
            holistic.onResults((nextResults) => {
              if (cancelled) return;
              setResults(nextResults);
              drawResults(nextResults);
              setStatus("running");
              processingRef.current = false;
            });
            holisticRef.current = holistic;

            const processLoop = async (timestamp) => {
              if (cancelled) return;
              const video = videoRef.current;
              if (video && holisticRef.current && video.readyState >= 2 && !processingRef.current && timestamp - lastProcessRef.current > 120) {
                processingRef.current = true;
                lastProcessRef.current = timestamp;
                try {
                  await holisticRef.current.send({ image: video });
                } catch {
                  processingRef.current = false;
                }
              }
              processRafRef.current = window.requestAnimationFrame(processLoop);
            };
            processRafRef.current = window.requestAnimationFrame(processLoop);
          } catch (caughtError) {
            setError(caughtError instanceof Error ? caughtError.message : "Camera opened, but tracking could not start.");
            setStatus("camera ready");
          }
        }, 120);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to start camera.");
        setStatus("error");
      }
    }

    start();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(previewRafRef.current);
      window.cancelAnimationFrame(processRafRef.current);
      holisticRef.current?.close();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      holisticRef.current = null;
      streamRef.current = null;
      processingRef.current = false;
    };
  }, [drawResults, drawVideoFrame, enabled]);

  const captureFrame = useCallback(() => {
    drawVideoFrame();
    const canvas = canvasRef.current;
    if (!canvas || !canvas.width || !canvas.height) return "";
    return canvas.toDataURL("image/jpeg", 0.86);
  }, [drawVideoFrame]);

  return { videoRef, canvasRef, results, status, error, captureFrame };
}
