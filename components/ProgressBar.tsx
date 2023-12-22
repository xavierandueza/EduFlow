import React from "react";

type ProgressBarProps = {
  score: number;
  width?: React.CSSProperties["width"];
  height?: React.CSSProperties["height"];
  backgroundColor?: React.CSSProperties["backgroundColor"];
  borderRadius?: React.CSSProperties["borderRadius"];
  color?: React.CSSProperties["color"];
  lineHeight?: React.CSSProperties["lineHeight"];
};

const ProgressBar = ({
  score,
  width = "100%",
  height = "20px",
  backgroundColor = "green",
  borderRadius = "8px",
  color = "white",
  lineHeight = "20px",
}: ProgressBarProps) => {
  const progress = Math.min(score, 100); // Ensure the progress does not exceed 100%

  return (
    <div
      className="progress-bar-container"
      style={{ width: width, backgroundColor: "#e0e0e0", borderRadius }}
    >
      <div
        className="progress-bar-fill"
        style={{
          height,
          width: `${progress}%`,
          backgroundColor,
          borderRadius,
          color,
          lineHeight,
          transition: "width 0.5s ease", // Smooth transition for width
        }}
      />
    </div>
  );
};

export default ProgressBar;
