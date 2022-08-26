import { Button } from "@mui/material";
import { MouseEventHandler } from "react";

const buttonSx = {
  color: "#fb6d00",
  borderColor: "#fb6d00",
  textAlign: "center",
  "&:hover": {
    borderColor: "#fb6d00",
    color: "#F9F9F9",
    backgroundColor: "#fb6d00"
  },
};

interface Props {
  children?: React.ReactNode;
  variant?: "text" | "outlined" | "contained" | undefined
  onClick?: () => void;
  disabled?: true | false
}

const MyButton: React.FC<Props> = ({
  children,
  variant,
  onClick,
  disabled
}) => {
  return (
    <Button sx={buttonSx} variant={variant} size="large" onClick={onClick} disabled={disabled}>
      {children}
    </Button>
  )
}

export default MyButton;
