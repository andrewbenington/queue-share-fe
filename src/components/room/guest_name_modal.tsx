import { Backdrop, Fade, Modal, TextField } from "@mui/material";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ModalContainerStyle,
  RoundedRectangle,
  StyledButton,
} from "../../pages/styles";
import { SetRoomGuest } from "../../service/room";
import { RoomContext } from "../../state/room";
import LoadingButton from "../loading_button";

interface GuestNameModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export default function GuestNameModal(props: GuestNameModalProps) {
  const { isOpen } = props;
  const [error, setError] = useState<string>();
  const [roomState, dispatchRoomState] = useContext(RoomContext);
  const [enteredGuestName, setEnteredGuestName] = useState<string>("");
  const navigate = useNavigate();

  const onSuccess = () => {
    setError(undefined);
    props.onSuccess();
  };

  const saveGuestName = async () => {
    if (!roomState?.roomPassword) return;
    const response = await SetRoomGuest(
      enteredGuestName,
      roomState.code,
      roomState.roomPassword
    );
    if ("error" in response) {
      setError(response.error);
      return;
    }
    localStorage.setItem("room_guest_id", response.id);
    dispatchRoomState({
      type: "set_guest_name",
      payload: response.name,
    });
    onSuccess();
  };

  return (
    <Modal
      open={isOpen}
      onClose={() => navigate("/")}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={isOpen}>
        <RoundedRectangle sx={ModalContainerStyle}>
          <TextField
            variant="outlined"
            label="Your Name"
            value={enteredGuestName}
            autoComplete="off"
            onChange={(e) => setEnteredGuestName(e.target.value)}
            error={!!error}
            helperText={error}
            sx={{ mb: 1 }}
          />
          <LoadingButton
            variant="contained"
            onClickAsync={saveGuestName}
            style={{ marginBottom: 8 }}
          >
            Join
          </LoadingButton>
          <StyledButton variant="outlined" onClick={() => navigate("/")}>
            Cancel
          </StyledButton>
        </RoundedRectangle>
      </Fade>
    </Modal>
  );
}
