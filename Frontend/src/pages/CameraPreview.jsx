import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";

export default function CameraPreview() {
  const videoRef = useRef(null);
  const canvasRef = useRef(document.createElement("canvas"));
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [studentCredits, setStudentCredits] = React.useState({});
  const [presentStudents, setPresentStudents] = React.useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const { className, _id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // List available video input devices
    navigator.mediaDevices.enumerateDevices().then(deviceInfos => {
      const cams = deviceInfos.filter(d => d.kind === "videoinput");
      setDevices(cams);
      if (cams.length > 0) setSelectedDeviceId(cams[0].deviceId);
    });
  }, []);

  useEffect(() => {
    let stream;
    let intervalId;

    async function init() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_PY_API_URL}/class/${className}`);
        setAllStudents(res.data.students || []);

        if (!selectedDeviceId) return;

        stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedDeviceId } },
          audio: false
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        intervalId = setInterval(async () => {
          if (!videoRef.current) return;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");

          canvas.width = 640;
          canvas.height = 480;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          const base64 = dataUrl.split(",")[1];

          try {
            const res = await axios.post(
              `${import.meta.env.VITE_PY_API_URL}/predict`,
              { image: base64 },
              { headers: { "Content-Type": "application/json" } }
            );
            console.log("Sending image size:", base64?.length, base64 ? "OK" : "NOT OK");
            console.log("Prediction:", res.data);

            const faces = res.data.faces || [];
            setRecentPredictions(prev => {
              const next = [...prev, faces];
              return next.length > 5 ? next.slice(-5) : next;
            });
          } catch (err) {
            console.error("Prediction error:", err.message);
          }
        }, 5000);
      } catch (err) {
        alert("Setup failed: " + err.message);
      }
    }

    init();

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (intervalId) clearInterval(intervalId);
    };
  }, [className, _id, selectedDeviceId]);

  useEffect(() => {
    if (recentPredictions.length === 1) {
      const detected = recentPredictions[0].map(face => face.id);
      setPresentStudents(detected);
      setStudentCredits(Object.fromEntries(detected.map(id => [id, 100])));
    }
  }, [recentPredictions]);

  useEffect(() => {
    if (recentPredictions.length > 0) {
      const latestDetected = recentPredictions[recentPredictions.length - 1].map(face => face.id);

      latestDetected.forEach(id => {
        if (id && !presentStudents.includes(id)) {
          setPresentStudents(prev => [...prev, id]);
          setStudentCredits(prev => ({ ...prev, [id]: 100 }));
        }
      });
    }
  }, [recentPredictions]);

  useEffect(() => {
    if (recentPredictions.length === 5) {
      presentStudents.forEach(id => {
        const missedOrDrowsy = recentPredictions.every(faces =>
          !faces.some(face => face.id === id && !face.drowsy)
        );
        setStudentCredits(prev => ({
          ...prev,
          [id]: missedOrDrowsy ? prev[id] - 10 : prev[id]
        }));
      });
    }
  }, [recentPredictions]);

  function exportCredits() {
    const data = presentStudents.map(id => ({
      Student: id,
      Credits: studentCredits[id] || 0
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Credits");
    XLSX.writeFile(wb, "class_credits.xlsx");
  }

  function handleEndClass() {
    const subject = className;
    // Present students
    const attendanceData = presentStudents.map(usn => ({
      USN: usn,
      Status: "p"
    }));
    // Absentees
    const absentees = allStudents.filter(usn => !presentStudents.includes(usn));

    // 1. Mark present students
    axios.post(
      `${import.meta.env.VITE_BASE_URL}/users/attendance-upload`,
      { subject, attendance: attendanceData }
    ).then(() => {
      // 2. Mark absentees
      if (absentees.length > 0) {
        axios.post(
          `${import.meta.env.VITE_BASE_URL}/users/attendance-absent`,
          { subject, absentees }
        ).then(() => {
          exportCredits();
          navigate("/teacher-home");
        }).catch(() => {
          alert("Failed to mark absentees.");
          navigate("/teacher-home");
        });
      } else {
        exportCredits();
        navigate("/teacher-home");
      }
    }).catch(() => {
      alert("Failed to upload attendance.");
      navigate("/teacher-home");
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", background: "#111" }}>
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ color: "#fff", fontWeight: "bold", marginRight: "1rem" }}>Select Camera:</label>
        <select
          value={selectedDeviceId}
          onChange={e => setSelectedDeviceId(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: "8px" }}
        >
          {devices.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId}`}
            </option>
          ))}
        </select>
      </div>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: "480px", maxWidth: "90vw", borderRadius: "16px", background: "#000", marginBottom: "2rem" }}
      />
      <button
        onClick={handleEndClass}
        style={{
          background: "linear-gradient(90deg,#6A29FF,#1d0036)",
          color: "#fff",
          padding: "0.75rem 2rem",
          border: "none",
          borderRadius: "8px",
          fontSize: "1.1rem",
          fontWeight: "bold",
          boxShadow: "0 2px 8px rgba(106,41,255,0.15)",
          cursor: "pointer",
          transition: "background 0.2s, transform 0.2s",
          marginTop: "1rem"
        }}
        onMouseOver={e => e.currentTarget.style.background = "linear-gradient(90deg,#1d0036,#6A29FF)"}
        onMouseOut={e => e.currentTarget.style.background = "linear-gradient(90deg,#6A29FF,#1d0036)"}
      >
        End Class & Download Credits
      </button>
    </div>
  );
}
