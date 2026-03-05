import "./MovieSelection.css";
import ContinueArrow from "./ContinueArrow";

export default function MovieSelection({ onContinue, template, selectedMovie, onSelectMovie }) {
  const data = template?.movieSelection || {};
  const movies = Array.isArray(data.movies) ? data.movies : [];
  const title = data.title || "Кино сонголт 🎬";
  const subtitle = data.subtitle || "Дуртай киногоо сонгоорой 💞";
  const hint = data.hint || "";
  const spinSeconds = Number(data.spinSeconds || 20);

  return (
    <div className="page page-enter">
      <div
        className="glass"
        style={{
          padding: "44px 36px",
          textAlign: "center",
          maxWidth: 720,
          width: "100%",
        }}
      >
        <h2
          className="font-script"
          style={{
            fontSize: "2.2rem",
            color: "var(--t-primary, var(--pink))",
            marginBottom: 10,
          }}
        >
          {title}
        </h2>

        <p className="movie-subtitle">{subtitle}</p>
        {hint ? <p className="movie-hint">{hint}</p> : null}

        <div className="movie-gallery-wrap">
          <div
            className="movie-box"
            style={{
              "--count": Math.max(1, movies.length),
              "--spin": `${Math.max(8, spinSeconds)}s`,
            }}
          >
            {movies.map((m, idx) => {
              const posterUrl = m?.posterUrl || "";
              const linkUrl = m?.linkUrl || "";
              const movieTitle = m?.title || `Movie ${idx + 1}`;
              const isSelected = selectedMovie === movieTitle;

              return (
                <span key={`${movieTitle}-${idx}`} style={{ "--i": idx + 1 }}>
                  <button
                    type="button"
                    className={`movie-poster-btn${isSelected ? " selected" : ""}`}
                    title={movieTitle}
                    onClick={() => {
                      if (typeof onSelectMovie === "function") {
                        onSelectMovie(movieTitle);
                      }
                      if (linkUrl) {
                        window.open(linkUrl, "_blank", "noopener,noreferrer");
                      }
                    }}
                  >
                    <img src={posterUrl} alt={movieTitle} loading="lazy" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>

        {typeof onContinue === "function" ? (
          <ContinueArrow onClick={onContinue} />
        ) : null}
      </div>
    </div>
  );
}
