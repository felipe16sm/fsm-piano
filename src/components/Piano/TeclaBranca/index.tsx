import { useState } from "react";
import sleep from "../../../utils/sleep";
import tocarNotas from "../../../utils/tocarNotas";

interface TeclaBrancaInterface {
  nota?: string;
  left?: number;
}

const TeclaBranca = ({ left = 0, nota }: TeclaBrancaInterface) => {
  const [teclaCor, setTeclaCor] = useState("white");

  const onClick = async () => {
    nota && tocarNotas(nota, 1);
    setTeclaCor("#C3C3C3");
    await sleep(200);
    setTeclaCor("white");
  };

  return (
    <div
      style={{
        position: "relative",
        left,
        height: 200,
        width: 40,
        backgroundColor: teclaCor,
        border: "solid black 1px",
        zIndex: 0,
        cursor: "pointer",
      }}
      onClick={onClick}
    ></div>
  );
};

export default TeclaBranca;
