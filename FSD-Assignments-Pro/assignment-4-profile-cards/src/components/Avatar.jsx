import { useState } from "react";

// Shows the photo from the image URL prop. If the URL fails (offline / broken link),
// it falls back to a gradient with the person's initials.
function Avatar({ name, image, hue, size = 88 }) {
  const [failed, setFailed] = useState(false);
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  if (image && !failed) {
    return <img className="avatar" src={image} alt={name} width={size} height={size} onError={() => setFailed(true)} />;
  }
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, background: `linear-gradient(135deg, hsl(${hue} 80% 62%), hsl(${(hue + 40) % 360} 75% 48%))` }}
      role="img"
      aria-label={`Avatar of ${name}`}
    >
      {initials}
    </div>
  );
}

export default Avatar;
