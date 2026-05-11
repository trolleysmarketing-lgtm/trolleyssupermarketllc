"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setVisible(false), 800);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes drawLineInfinite {
          0% { stroke-dashoffset: 100%; fill-opacity: 0; }
          20% { fill-opacity: 0; }
          40% { fill-opacity: 0.5; }
          60% { stroke-dashoffset: 0%; fill-opacity: 1; }
          80% { fill-opacity: 1; stroke-dashoffset: 0%; }
          100% { stroke-dashoffset: 100%; fill-opacity: 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(14,118,188,0.3)); }
          50% { filter: drop-shadow(0 0 16px rgba(14,118,188,0.9)); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.02); opacity: 0.3; }
        }
        @keyframes bounceLoader {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        .draw-blue { fill: #0e76bc; fill-opacity: 0; stroke: #0e76bc; stroke-width: 2; stroke-dasharray: 100%; stroke-dashoffset: 100%; animation: drawLineInfinite 3.5s cubic-bezier(0.4,0,0.2,1) infinite; }
        .draw-red { fill: #de2b2e; fill-opacity: 0; stroke: #de2b2e; stroke-width: 2; stroke-dasharray: 100%; stroke-dashoffset: 100%; animation: drawLineInfinite 3.5s cubic-bezier(0.4,0,0.2,1) 0.5s infinite; }
        .draw-red2 { fill: #de2b2e; fill-opacity: 0; stroke: #de2b2e; stroke-width: 2; stroke-dasharray: 100%; stroke-dashoffset: 100%; animation: drawLineInfinite 3.5s cubic-bezier(0.4,0,0.2,1) 1s infinite; }
        .breath { animation: breathe 3s ease-in-out infinite; }
        .glow { animation: pulseGlow 2s ease-in-out infinite; }
        .bounce1 { animation: bounceLoader 1.4s -0.32s infinite ease-in-out; }
        .bounce2 { animation: bounceLoader 1.4s -0.16s infinite ease-in-out; }
        .bounce3 { animation: bounceLoader 1.4s 0s infinite ease-in-out; }
        .preloader-fade { transition: opacity 0.8s ease, visibility 0.8s ease; }

        /* New animation styles */
        .blue {
          fill: none;
          stroke: #1B75BB;
          stroke-width: 80;
          stroke-linecap: square;
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: draw 1.8s ease forwards;
        }

        .redU {
          fill: none;
          stroke: #DB2B2C;
          stroke-width: 80;
          stroke-linecap: round;
          stroke-dasharray: 700;
          stroke-dashoffset: 700;
          animation: draw 2s ease forwards;
          animation-delay: 0.8s;
        }

        .dot {
          fill: #DB2B2C;
          opacity: 0;
          transform: translateY(30px);
          animation: pop 0.8s ease forwards;
        }

        .dot.left {
          animation-delay: 1.6s;
        }

        .dot.right {
          animation-delay: 1.8s;
        }

        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes pop {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.8);
          }
          60% {
            opacity: 1;
            transform: translateY(-10px) scale(1.05);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>

      <div
        className="preloader-fade"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: fadeOut ? 0 : 1,
          visibility: fadeOut ? "hidden" : "visible",
        }}
      >
        <div style={{ textAlign: "center" }}>
          {/* New Animated Logo */}
          <div style={{ marginBottom: 32 }}>
            <svg viewBox="0 0 260 466" xmlns="http://www.w3.org/2000/svg" width="130" height="233" style={{ margin: "0 auto", display: "block" }}>
              {/* Blue shape */}
              <path className="blue" d="M40 0 V200 M40 100 H220" />

              {/* Red U shape */}
              <path className="redU" d="M40 240 A90 90 0 0 0 220 240" />

              {/* Bottom dots */}
              <circle className="dot left" cx="90" cy="410" r="40"/>
              <circle className="dot right" cx="170" cy="410" r="40"/>
            </svg>
          </div>

          {/* Original Logo (kept for reference, can be removed) */}
          <div style={{ marginBottom: 32, display: "none" }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96.1 172.5" width="80" height="144" style={{ margin: "0 auto", display: "block" }}>
              <path className="draw-blue glow" d="M0.3,75.8h27.8c-0.1-7.6,0.2-17.6,0.2-25.5h66.8V22.9h-67V0H0c0.1,2.2,0.3,4.1,0.3,5.9C0.3,28.4,0.4,53.3,0.3,75.8"/>
              <path className="draw-red" d="M95.6,77.8H67.7c0,4.4,0,7.5,0,11.7c0,1.4-0.1,2.9-0.6,4.2c-3.9,9.7-10.5,14-21.2,13.1c-10.1-0.9-16.8-7.3-17.4-17.2c-0.2-2.9-0.3-8.9-0.4-11.8H0.2c0,0.9,0,5,0,5.9c0,8.4,1,16.5,4.7,24.1c6.5,13.3,17.2,21.1,31.6,24.3c12.6,2.8,24.8,1.5,36.1-4.5C91.6,117.4,98.1,98.4,95.6,77.8"/>
              <path className="draw-red2" d="M27.9,172.5c-0.4,0-0.8,0-1.1,0c-4.7-0.3-8.9-2.4-12-5.9c-3.1-3.5-4.7-8.1-4.4-12.8c0.6-10.1,8.5-17.3,18.4-16.8c10,0.5,17.4,8.7,16.8,18.5c-0.3,4.9-2.4,9.4-5.9,12.6C36.4,170.9,32.3,172.5,27.9,172.5"/>
              <path className="draw-red2" d="M68,172.5c-0.1,0-0.3,0-0.4,0c-9.3-0.2-17-8.4-16.8-18l0,0c0.1-4.9,2.1-9.5,5.5-12.7c3.4-3.2,7.9-4.9,12.7-4.7c10.1,0.4,17.3,8,17.1,18C85.8,165.2,78.2,172.5,68,172.5"/>
              <path className="breath" d="M0.3,75.8h27.8c-0.1-7.6,0.2-17.6,0.2-25.5h66.8V22.9h-67V0H0c0.1,2.2,0.3,4.1,0.3,5.9C0.3,28.4,0.4,53.3,0.3,75.8" fill="none" stroke="#0e76bc" strokeWidth="1.5"/>
            </svg>
          </div>

          {/* Dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
            <div className="bounce1" style={{ width: 8, height: 8, background: "#0e76bc", borderRadius: "50%" }} />
            <div className="bounce2" style={{ width: 8, height: 8, background: "#0e76bc", borderRadius: "50%" }} />
            <div className="bounce3" style={{ width: 8, height: 8, background: "#de2b2e", borderRadius: "50%" }} />
          </div>
        </div>
      </div>
    </>
  );
}