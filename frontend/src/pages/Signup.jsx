import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearError, signup } from "../app/redux/authSlice";

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ fullName: "", username: "", email: "", password: "", confirm: "" });
  const [localError, setLocalError] = useState("");

  if (user) return <Navigate to="/" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    if (!/^[A-Za-z ]{3,}$/.test(form.fullName.trim())) return "Full name: letters and spaces only, at least 3 characters";
    if (!/^[A-Za-z0-9_]{3,}$/.test(form.username)) return "Username: letters, numbers or _ (at least 3)";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email address";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (form.password !== form.confirm) return "Passwords do not match";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const problem = validate();
    setLocalError(problem);
    if (problem) return;
    const { confirm, ...body } = form; // eslint-disable-line no-unused-vars
    const result = await dispatch(signup(body));
    if (signup.fulfilled.match(result)) navigate("/login", { state: { message: "Account created. Please log in." } });
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <h1>Create account</h1>
        <p className="muted">New accounts are created as Manager</p>
        {(localError || error) && <div className="alert err">{localError || error}</div>}
        <label className="field">
          <span>Full name</span>
          <input required value={form.fullName} onChange={set("fullName")} />
        </label>
        <label className="field">
          <span>Username</span>
          <input required value={form.username} onChange={set("username")} />
        </label>
        <label className="field">
          <span>Email</span>
          <input type="email" required value={form.email} onChange={set("email")} />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" required value={form.password} onChange={set("password")} />
        </label>
        <label className="field">
          <span>Confirm password</span>
          <input type="password" required value={form.confirm} onChange={set("confirm")} />
        </label>
        <button className="btn block" disabled={loading}>
          {loading ? "Creating..." : "Sign up"}
        </button>
        <p className="muted center">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
