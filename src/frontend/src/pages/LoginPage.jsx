import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
} from "@mui/material";
import { login } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login(form);
      loginUser(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          mt: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" fontWeight="bold" mb={3}>
          Task Manager
        </Typography>
        <Typography variant="h6" mb={2}>
          Login
        </Typography>
        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            data-testid="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            data-testid="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
            data-testid="login-btn"
          >
            Login
          </Button>
          <Typography mt={2} textAlign="center">
            No account? <Link to="/register">Register here</Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
