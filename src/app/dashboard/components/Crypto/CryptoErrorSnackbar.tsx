import React from "react";
import { Snackbar, Alert } from "@mui/material";

const CryptoErrorSnackbar = ({ error, handleClose }: { error: any; handleClose: () => void }) => {
  return (
    <Snackbar open={error.show} autoHideDuration={6000} onClose={handleClose}>
      <Alert onClose={handleClose} severity="error">
        {error.message}
      </Alert>
    </Snackbar>
  );
};

export default CryptoErrorSnackbar;
