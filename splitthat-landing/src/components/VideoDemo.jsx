import { VIDEO_SRC } from "../config.js";

export default function VideoDemo() {
  return (
    <div className="rounded-xl overflow-hidden bg-black">
      <video
        src={VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        aria-label="SplitThat demo video"
      />
    </div>
  );
}
