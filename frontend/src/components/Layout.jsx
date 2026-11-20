import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../app/redux/authSlice";
import { modules } from "../modules";
import useRole from "../hooks/useRole";

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const { isAdmin, role } = useRole();

  const onLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <h2 className="brand">Agri Manager</h2>
        <nav>
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          {modules
            .filter((m) => !m.adminOnly || isAdmin)
            .map((m) => (
              <NavLink key={m.key} to={m.path}>
                {m.title}
              </NavLink>
            ))}
        </nav>
        <div className="userbox">
          <div>
            <strong>{user?.fullName}</strong>
            <span className={`badge b-${role}`}>{role}</span>
          </div>
          <button className="btn ghost small" onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
