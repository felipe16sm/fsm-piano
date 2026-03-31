import TeclaBranca from "./TeclaBranca";
import TeclaPreta from "./TeclaPreta";

const Piano = () => {
  return (
    <div
      style={{
        position: "absolute",
        left: "4%",
        display: "flex",
        margin: "0 auto",
        maxWidth: "96vw",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "relative", display: "flex", zIndex: 0 }}>
        <TeclaBranca nota="C1" />
        <TeclaPreta nota="C#1" left={-11} />
        <TeclaBranca nota="D1" left={-21} />
        <TeclaPreta nota="D#1" left={-32} />
        <TeclaBranca nota="E1" left={-43} />
        <TeclaBranca nota="F1" left={-44} />
        <TeclaPreta nota="F#1" left={-54} />
        <TeclaBranca nota="G1" left={-65} />
        <TeclaPreta nota="G#1" left={-76} />
        <TeclaBranca nota="A1" left={-87} />
        <TeclaPreta nota="A#1" left={-98} />
        <TeclaBranca nota="B1" left={-109} />
      </div>
      <div
        style={{ position: "relative", left: -110, display: "flex", zIndex: 0 }}
      >
        <TeclaBranca nota="C2" />
        <TeclaPreta nota="C#2" left={-11} />
        <TeclaBranca nota="D2" left={-21} />
        <TeclaPreta nota="D#2" left={-32} />
        <TeclaBranca nota="E2" left={-43} />
        <TeclaBranca nota="F2" left={-44} />
        <TeclaPreta nota="F#2" left={-54} />
        <TeclaBranca nota="G2" left={-65} />
        <TeclaPreta nota="G#2" left={-76} />
        <TeclaBranca nota="A2" left={-87} />
        <TeclaPreta nota="A#2" left={-98} />
        <TeclaBranca nota="B2" left={-109} />
      </div>
      <div
        style={{ position: "relative", left: -220, display: "flex", zIndex: 0 }}
      >
        <TeclaBranca nota="C3" />
        <TeclaPreta nota="C#3" left={-11} />
        <TeclaBranca nota="D3" left={-21} />
        <TeclaPreta nota="D#3" left={-32} />
        <TeclaBranca nota="E3" left={-43} />
        <TeclaBranca nota="F3" left={-44} />
        <TeclaPreta nota="F#3" left={-54} />
        <TeclaBranca nota="G3" left={-65} />
        <TeclaPreta nota="G#3" left={-76} />
        <TeclaBranca nota="A3" left={-87} />
        <TeclaPreta nota="A#3" left={-98} />
        <TeclaBranca nota="B3" left={-109} />
      </div>
      <div
        style={{ position: "relative", left: -330, display: "flex", zIndex: 0 }}
      >
        <TeclaBranca nota="C4" />
        <TeclaPreta nota="C#4" left={-11} />
        <TeclaBranca nota="D4" left={-21} />
        <TeclaPreta nota="D#4" left={-32} />
        <TeclaBranca nota="E4" left={-43} />
        <TeclaBranca nota="F4" left={-44} />
        <TeclaPreta nota="F#4" left={-54} />
        <TeclaBranca nota="G4" left={-65} />
        <TeclaPreta nota="G#4" left={-76} />
        <TeclaBranca nota="A4" left={-87} />
        <TeclaPreta nota="A#4" left={-98} />
        <TeclaBranca nota="B4" left={-109} />
      </div>
      <div
        style={{ position: "relative", left: -440, display: "flex", zIndex: 0 }}
      >
        <TeclaBranca nota="C5" />
        <TeclaPreta nota="C#5" left={-11} />
        <TeclaBranca nota="D5" left={-21} />
        <TeclaPreta nota="D#5" left={-32} />
        <TeclaBranca nota="E5" left={-43} />
        <TeclaBranca nota="F5" left={-44} />
        <TeclaPreta nota="F#5" left={-54} />
        <TeclaBranca nota="G5" left={-65} />
        <TeclaPreta nota="G#5" left={-76} />
        <TeclaBranca nota="A5" left={-87} />
        <TeclaPreta nota="A#5" left={-98} />
        <TeclaBranca nota="B5" left={-109} />
      </div>
       <div
        style={{ position: "relative", left: -550, display: "flex", zIndex: 0 }}
      >
        <TeclaBranca nota="C6" />
        <TeclaPreta nota="C#6" left={-11} />
        <TeclaBranca nota="D6" left={-21} />
        <TeclaPreta nota="D#6" left={-32} />
        <TeclaBranca nota="E6" left={-43} />
        <TeclaBranca nota="F6" left={-44} />
        <TeclaPreta nota="F#6" left={-54} />
        <TeclaBranca nota="G6" left={-65} />
        <TeclaPreta nota="G#6" left={-76} />
        <TeclaBranca nota="A6" left={-87} />
        <TeclaPreta nota="A#6" left={-98} />
        <TeclaBranca nota="B6" left={-109} />
      </div>
    </div>
  );
};

export default Piano;
