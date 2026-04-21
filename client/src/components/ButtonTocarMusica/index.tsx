import { Button } from "antd";
import tocarMusica from "../../utils/tocarMusica";

interface ButtonTocarMusicaInterface {
  entries: EntryWithId[];
  style?: React.CSSProperties | undefined;
}

const ButtonTocarMusica = ({ entries, style }: ButtonTocarMusicaInterface) => {
  return (
    <Button
      style={style}
      disabled={entries.length === 0}
      onClick={() => {
        tocarMusica(entries);
      }}
    >
      ▶ Tocar Música
    </Button>
  );
};

export default ButtonTocarMusica;
