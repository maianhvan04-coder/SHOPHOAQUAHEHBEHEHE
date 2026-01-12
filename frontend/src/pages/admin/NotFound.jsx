import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const BG_VIDEO = `${import.meta.env.BASE_URL}video/IMG_3538.MP4`;

export default function ForbiddenPage() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    v.muted = true;
    v.volume = 1;

    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, []);

  const enableSound = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.muted = false;
      v.volume = 1;
      setMuted(false);
      await v.play();
    } catch {
      v.muted = true;
      setMuted(true);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <div className="forbidden">
      <video
        ref={videoRef}
        className="forbidden__bg"
        autoPlay
        loop
        playsInline
        preload="auto"
        muted={muted}
        aria-hidden="true"
      >
        <source src={BG_VIDEO} type="video/mp4" />
      </video>

      <div className="forbidden__overlay" />

      <div className="forbidden__audio">
        {muted ? (
          <button className="audioBtn audioBtn--primary" onClick={enableSound} type="button">
            🔊 Bật âm thanh
          </button>
        ) : (
          <button className="audioBtn" onClick={toggleMute} type="button">
            🔊 Tắt âm
          </button>
        )}
      </div>

      <main className="forbidden__content" role="main" aria-label="Forbidden">
        <div className="forbidden__pill">CẢNH BÁO</div>

        <h1 className="forbidden__title">Cấm truy cập vào trang này</h1>
        <p className="forbidden__desc">Bạn không có quyền để xem nội dung này.</p>

        <div className="forbidden__actions">
          <Link to="/" className="btn btn--primary">Về trang chủ</Link>
          <Link to="/login" className="btn btn--ghost">Đăng nhập lại</Link>
          <button type="button" className="btn btn--outline" onClick={() => navigate(-1)}>
            Quay lại
          </button>
        </div>
      </main>

      <style>{`
        .forbidden{
          position: relative;
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 28px 16px;
          overflow: hidden;
          background: #050505;
          color: #fff;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        }

        .forbidden__bg{
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1.03);
          opacity: 0.88;
          filter: saturate(1.25) contrast(1.08);
          pointer-events: none;
        }

        .forbidden__overlay{
          position: absolute;
          inset: 0;
          background:
            radial-gradient(900px 500px at 50% 20%, rgba(255,60,60,.16), transparent 60%),
            linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,.72));
          pointer-events: none;
        }

        .forbidden__audio{
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 5;
        }

        .audioBtn{
          border: 1px solid rgba(255,255,255,.18);
          background: rgba(0,0,0,.35);
          color: rgba(255,255,255,.92);
          padding: 10px 12px;
          border-radius: 12px;
          font-weight: 850;
          cursor: pointer;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: transform .12s ease, background .12s ease, border-color .12s ease;
        }
        .audioBtn:hover{
          transform: translateY(-1px);
          background: rgba(0,0,0,.45);
          border-color: rgba(255,255,255,.26);
        }
        .audioBtn--primary{
          border-color: rgba(255,60,60,.35);
          background: rgba(255,60,60,.14);
        }

        .forbidden__content{
          position: relative;
          z-index: 3;
          width: 100%;
          max-width: 760px;
          text-align: center;
          text-shadow: 0 16px 40px rgba(0,0,0,.65);
        }

        .forbidden__pill{
          display: inline-flex;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255, 60, 60, .14);
          border: 1px solid rgba(255, 60, 60, .28);
          font-weight: 950;
          font-size: 12px;
          letter-spacing: .9px;
          color: rgba(255,255,255,.95);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          margin-bottom: 12px;
        }

        .forbidden__title{
          margin: 0;
          font-size: 34px;
          font-weight: 950;
          letter-spacing: -0.5px;
        }

        .forbidden__desc{
          margin: 10px auto 18px;
          max-width: 560px;
          color: rgba(255,255,255,.86);
          line-height: 1.6;
          font-size: 15px;
        }

        .forbidden__actions{
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .btn{
          appearance: none;
          border: 0;
          cursor: pointer;
          padding: 11px 14px;
          border-radius: 12px;
          font-weight: 900;
          text-decoration: none;
          transition: transform .12s ease, box-shadow .12s ease, background .12s ease, border-color .12s ease;
          user-select: none;
        }
        .btn:active{ transform: translateY(1px) scale(0.99); }

        .btn--primary{
          background: #ffffff;
          color: #0b0b0b;
          box-shadow: 0 10px 26px rgba(0,0,0,.35);
        }
        .btn--primary:hover{ transform: translateY(-1px); box-shadow: 0 16px 36px rgba(0,0,0,.45); }

        .btn--ghost{
          background: rgba(255,255,255,.10);
          color: rgba(255,255,255,.92);
          border: 1px solid rgba(255,255,255,.18);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .btn--ghost:hover{
          background: rgba(255,255,255,.14);
          border-color: rgba(255,255,255,.24);
          transform: translateY(-1px);
        }

        .btn--outline{
          background: transparent;
          color: rgba(255,255,255,.92);
          border: 1px solid rgba(255,255,255,.26);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .btn--outline:hover{ background: rgba(255,255,255,.07); transform: translateY(-1px); }

        @media (prefers-reduced-motion: reduce){
          .forbidden__bg{ display: none; }
        }
      `}</style>
    </div>
  );
}
