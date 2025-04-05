import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Avatar,
  Typography,
  Container,
  TextField,
  Button,
  Box,
} from "@mui/material";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username === "admin" && password === "password") {
      navigate("/home");
    } else {
      alert("Invalid credentials!");
    }
  };

  return (
    <>
      {/* Navbar with left-aligned logo and name */}
      <AppBar position="static" sx={{ backgroundColor: "#003366" }}>
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              alt="Company Logo"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Seal_of_UIDAI.svg/2048px-Seal_of_UIDAI.svg.png"
              sx={{ width: 40, height: 40, mr: 2 }}
            />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Network Shield
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Login Form */}
      <Container maxWidth="xs" sx={{ mt: 10, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        <TextField
          fullWidth
          margin="normal"
          label="Username"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleLogin}
        >
          Login
        </Button>
      </Container>
    </>
  );
};

export default Login;
