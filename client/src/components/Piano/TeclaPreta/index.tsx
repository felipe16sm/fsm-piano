import { useState } from "react";
import sleep from "../../../utils/sleep";
import tocarNotas from "../../../utils/tocarNotas";

interface TeclaPretaInterface {
  nota?: string;
  left?: number;
}

const TeclaPreta = ({ left = 0, nota }: TeclaPretaInterface) => {
  const [teclaCor, setTeclaCor] = useState("#333333");

  const onClick = async () => {
    nota && tocarNotas(nota, 1);
    setTeclaCor("#5a5a5aff");
    await sleep(200);
    setTeclaCor("#333333");
  };
  return (
    <div
      style={{
        position: "relative",
        left,
        height: 120,
        width: 20,
        backgroundColor: teclaCor,
        zIndex: 1,
        cursor: "pointer",
      }}
      onClick={onClick}
    ></div>
  );
};

export default TeclaPreta;
