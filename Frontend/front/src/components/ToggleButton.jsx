import React, { useState } from "react";
import { Button, Typography } from "@mui/material";

const ToggleButton = () => {
  const [isLogging, setIsLogging] = useState(false);

  const handleToggle = () => setIsLogging((prev) => !prev);

  return (
    <div>
      <Typography variant="h5">{isLogging ? "Logging Active" : "Logging Stopped"}</Typography>
      <Button variant="contained" color={isLogging ? "error" : "success"} sx={{ mt: 2 }} onClick={handleToggle}>
        {isLogging ? "Stop Logging" : "Start Logging"}
      </Button>
    </div>
  );
};

export default ToggleButton;
