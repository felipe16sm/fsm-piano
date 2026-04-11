import FSMImg from "../../../assets/FSMpiano_transparent.png";
import { Typography } from "antd";

const Header = () => {
    const { Title } = Typography;
    
  return (
    <Title
      level={2}
      style={{
        display: "flex",
        alignItems: "center",
        textAlign: "center",
        marginBottom: 32,
      }}
    >
      <img
        src={FSMImg}
        style={{ backgroundColor: "#00703c", borderRadius: 8 }}
        className="base"
        width="100"
        height="80"
        alt=""
      />{" "}
      <div
        style={{
          width: 160,
          color: "#b7ffe7ff",
        }}
      >
        FSM Piano
      </div>
    </Title>
  );
};

export default Header