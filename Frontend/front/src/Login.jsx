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
  Paper,
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
      {/* Navbar */}
      <AppBar position="static" sx={{ backgroundColor: "#4E342E" }}>
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              alt="Company Logo"
              src="/em11.jpg"
              sx={{ width: 50, height: 50, mr: 2 }}
            />
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "#ffffff", letterSpacing: 1 }}
            >
              GoI Server
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Login Card */}
      <Container maxWidth="sm" sx={{ mt: 12 }}>
        <Paper
          elevation={6}
          sx={{ padding: 6, borderRadius: 3, backgroundColor: "#FBE9E7" }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#5D4037" }}
          >
            Admin Login
          </Typography>

          <TextField
            fullWidth
            margin="normal"
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#fff",
              },
            }}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#fff",
              },
            }}
          />

          <Button
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              backgroundColor: "#6D4C41",
              "&:hover": {
                backgroundColor: "#5D4037",
              },
              fontWeight: "bold",
              letterSpacing: 0.5,
            }}
            onClick={handleLogin}
          >
            Login
          </Button>
        </Paper>
      </Container>
    </>
  );
};

export default Login;
