import React, { useEffect, useRef } from "react";

export default function CameraPreview() {
  const videoRef = useRef(null);

  useEffect(() => {
    let stream;
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((mediaStream) => {
        stream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        alert("Could not access camera: " + err.message);
      });
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#111" }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        style={{ width: "480px", maxWidth: "90vw", borderRadius: "16px", background: "#000" }}
      />
    </div>
  );
}