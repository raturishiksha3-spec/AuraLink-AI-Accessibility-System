import { useCallback, useEffect, useRef, useState } from "react";

export function useCameraFrame({ enabled = true } = {}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(0);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const drawFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const width = video.videoWidth || 960;
    const height = video.videoHeight || 540;
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(video, 0, 0, width, height);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;

    async function startCamera() {
      try {
        setStatus("loading");
        setError("");
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera access is not available in this browser.");
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 960 }, height: { ideal: 540 }, facingMode: "environment" },
          audio: false
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("running");

        const loop = () => {
          drawFrame();
          animationRef.current = window.requestAnimationFrame(loop);
        };
        loop();
      } catch (caughtError) {
        setStatus("error");
        setError(caughtError instanceof Error ? caughtError.message : "Unable to start the camera.");
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [drawFrame, enabled]);

  const captureFrame = useCallback(() => {
    drawFrame();
    const canvas = canvasRef.current;
    if (!canvas || !canvas.width || !canvas.height) return "";
    return canvas.toDataURL("image/jpeg", 0.86);
  }, [drawFrame]);

  return { videoRef, canvasRef, captureFrame, status, error };
}
