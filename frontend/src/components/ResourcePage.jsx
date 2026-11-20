// One reusable page: table + search + add / edit / delete for any module in modules.jsx.
// Managers can view and add. Only admins see Edit and Delete (the server enforces it too).
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resources } from "../app/redux/resources";
import { errMsg } from "../app/redux/resourceSlice";
import useRole from "../hooks/useRole";
import Modal from "./Modal";
import ConfirmModal from "./ConfirmModal";

const isoDate = (v) => (v ? String(v).slice(0, 10) : "");

const initialValues = (fields, row) => {
  const v = {};
  fields.forEach((f) => {
    if (f.type === "file") return;
    if (row) v[f.name] = f.type === "date" ? isoDate(row[f.name]) : row[f.name] ?? "";
    else v[f.name] = f.default ?? "";
    if (f.type === "password") v[f.name] = "";
  });
  return v;
};

function Field({ f, value, onChange, options, editing }) {
  const required = f.required || (f.requiredOnCreate && !editing);
  const common = { id: f.name, required, value: value ?? "", onChange };

  let input;
  if (f.type === "select") {
    input = (
      <select {...common}>
        <option value="">{required ? "Select..." : "None"}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else if (f.type === "textarea") {
    input = <textarea rows="3" {...common} />;
  } else {
    input = <input type={f.type} placeholder={f.placeholder} min={f.min} max={f.max} step={f.type === "number" ? "any" : undefined} {...common} />;
  }
  return (
    <label className="field">
      <span>
        {f.label}
        {required && " *"}
      </span>
      {input}
    </label>
  );
}

export default function ResourcePage({ module: m }) {
  const dispatch = useDispatch();
  const { canEdit, isAdmin } = useRole();
  const res = resources[m.key];
  const { items, loading, error } = useSelector((s) => s[m.key]);
  const all = useSelector((s) => s); // for dropdown options (crops, workers, equipment)

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | row
  const [values, setValues] = useState({});
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    dispatch(res.fetchAll());
    m.fields.filter((f) => f.from).forEach((f) => dispatch(resources[f.from].fetchAll()));
  }, [m.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const optionsFor = (f) =>
    f.from
      ? (all[f.from]?.items || []).map((o) => ({ value: o.id, label: o[f.labelKey] }))
      : (f.options || []).map((o) => ({ value: o, label: o }));

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((row) =>
      m.columns.some((c) => {
        const v = c.render ? c.render(row) : row[c.key];
        return (typeof v === "string" || typeof v === "number") && String(v).toLowerCase().includes(q);
      })
    );
  }, [items, search, m.columns]);

  if (m.adminOnly && !isAdmin) return <Navigate to="/" replace />;

  const openForm = (row) => {
    setEditing(row || "new");
    setValues(initialValues(m.fields, row));
    setFile(null);
    setFormError("");
  };

  const buildBody = () => {
    const clean = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== "" && v !== null));
    if (!m.hasFile) return clean;
    const fd = new FormData();
    Object.entries(clean).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append("photo", file);
    return fd;
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (m.hasFile && editing === "new" && !file) return setFormError("Please choose a photo (JPG or PNG, max 1 MB)");
    setSaving(true);
    try {
      const body = buildBody();
      if (editing === "new") await dispatch(res.create(body)).unwrap();
      else await dispatch(res.update({ id: editing.id, body })).unwrap();
      setNotice(editing === "new" ? `${m.singular} added` : `${m.singular} updated`);
      setEditing(null);
    } catch (err) {
      setFormError(typeof err === "string" ? err : errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setSaving(true);
    try {
      await dispatch(res.remove(toDelete.id)).unwrap();
      setNotice(`${m.singular} deleted`);
    } catch (err) {
      setNotice("");
      setFormError(typeof err === "string" ? err : errMsg(err));
    } finally {
      setSaving(false);
      setToDelete(null);
    }
  };

  return (
    <div>
      <div className="page-head">
        <h1>{m.title}</h1>
        <div className="tools">
          <input className="search" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {!m.readOnly && (
            <button className="btn" onClick={() => openForm(null)}>
              + Add {m.singular}
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div className="alert ok" onClick={() => setNotice("")}>
          {notice}
        </div>
      )}
      {(error || (formError && !editing)) && <div className="alert err">{error || formError}</div>}

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              {m.columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
              {!m.readOnly && canEdit && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={row.id}>
                {m.columns.map((c) => {
                  const val = c.render ? c.render(row) : row[c.key] ?? "-";
                  return (
                    <td key={c.key}>
                      {c.badge ? <span className={`badge s-${String(val).toLowerCase().replace(/\s+/g, "-")}`}>{val}</span> : val}
                    </td>
                  );
                })}
                {!m.readOnly && canEdit && (
                  <td className="row-actions">
                    <button className="btn small ghost" onClick={() => openForm(row)}>
                      Edit
                    </button>
                    <button className="btn small danger" onClick={() => setToDelete(row)}>
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {!shown.length && (
              <tr>
                <td colSpan={m.columns.length + 1} className="empty">
                  {loading ? "Loading..." : "No records found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={`${editing === "new" ? "Add" : "Edit"} ${m.singular}`} onClose={() => setEditing(null)}>
          <form onSubmit={submit}>
            <div className="grid">
              {m.fields.map((f) =>
                f.type === "file" ? (
                  <label className="field" key={f.name}>
                    <span>
                      {f.label}
                      {editing === "new" && " *"}
                    </span>
                    <input type="file" accept="image/png,image/jpeg" onChange={(e) => setFile(e.target.files[0] || null)} />
                  </label>
                ) : (
                  <Field
                    key={f.name}
                    f={f}
                    value={values[f.name]}
                    options={f.type === "select" ? optionsFor(f) : []}
                    editing={editing !== "new"}
                    onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                  />
                )
              )}
            </div>
            {formError && <div className="alert err">{formError}</div>}
            <div className="actions">
              <button type="button" className="btn ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="btn" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {toDelete && (
        <ConfirmModal
          message={`Delete this ${m.singular}? This cannot be undone.`}
          busy={saving}
          onCancel={() => setToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
