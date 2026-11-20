import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearError, login } from "../app/redux/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ username: "", password: "" });

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) navigate("/", { replace: true });
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <h1>Agri Manager</h1>
        <p className="muted">Log in to continue</p>
        {location.state?.message && <div className="alert ok">{location.state.message}</div>}
        {error && <div className="alert err">{error}</div>}
        <label className="field">
          <span>Username or email</span>
          <input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        <button className="btn block" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
        <p className="muted center">
          No account?{" "}
          <Link to="/signup" onClick={() => dispatch(clearError())}>
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
