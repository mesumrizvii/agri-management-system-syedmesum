import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resources } from "../app/redux/resources";

const LOAD = ["crops", "orders", "buyers", "tasks", "expenses", "inventory", "workers", "equipment", "activity"];
const num = (v) => Number(v) || 0;

function Stat({ label, value, tone }) {
  return (
    <div className={`card stat ${tone || ""}`}>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
    </div>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const s = useSelector((st) => st);

  // load every module once when the dashboard opens
  useEffect(() => {
    LOAD.forEach((k) => dispatch(resources[k].fetchAll()));
  }, [dispatch]);

  const crops = s.crops.items;
  const expensesTotal = s.expenses.items.reduce((sum, e) => sum + num(e.amount), 0);
  const lowStock = s.inventory.items.filter((i) => num(i.qty) <= num(i.minQty)).length;
  const pendingTasks = s.tasks.items.filter((t) => t.status !== "Done").length;
  const underRepair = s.equipment.items.filter((e) => e.status === "Under Repair").length;
  const activeWorkers = s.workers.items.filter((w) => w.status === "Active").length;
  const harvest = crops.reduce((sum, c) => sum + num(c.harvestQty), 0);
  const recent = s.activity.items.slice(0, 8);

  return (
    <div>
      <div className="page-head">
        <h1>Dashboard</h1>
        <span className="muted">Welcome, {user?.fullName}</span>
      </div>

      <div className="stats">
        <Stat label="Crops" value={crops.length} />
        <Stat label="Healthy" value={crops.filter((c) => c.status === "Healthy").length} tone="good" />
        <Stat label="Needs attention" value={crops.filter((c) => c.status === "Needs Attention").length} tone="warn" />
        <Stat label="Critical" value={crops.filter((c) => c.status === "Critical").length} tone="bad" />
        <Stat label="Total harvest qty" value={harvest.toLocaleString()} />
        <Stat label="Orders" value={s.orders.items.length} />
        <Stat label="Buyers" value={s.buyers.items.length} />
        <Stat label="Total expenses" value={expensesTotal.toLocaleString()} />
        <Stat label="Pending tasks" value={pendingTasks} tone={pendingTasks ? "warn" : ""} />
        <Stat label="Low stock items" value={lowStock} tone={lowStock ? "bad" : ""} />
        <Stat label="Active workers" value={activeWorkers} />
        <Stat label="Equipment under repair" value={underRepair} tone={underRepair ? "warn" : ""} />
      </div>

      <div className="card">
        <h3>Recent activity</h3>
        {recent.length ? (
          <ul className="feed">
            {recent.map((a) => (
              <li key={a.id}>
                <span className={`badge s-${a.action}`}>{a.action}</span> <strong>{a.user}</strong> {a.entity}
                <span className="muted"> · {new Date(a.timestamp).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No activity yet</p>
        )}
      </div>
    </div>
  );
}
