import logoPng from "./logo.png";

export default function Logo({
  alt = "Logo",
  className = "",
  width = 48,
  height = 48,
  ...rest
}) {
  return (
    <img
      src={logoPng}
      alt={alt}
      width={width}
      height={height}
      className={className}
      draggable={false}
      {...rest}
    />
  );
}
