import Modal from "./Modal";

// "Are you sure?" dialog used before every delete.
export default function ConfirmModal({ message, onConfirm, onCancel, busy }) {
  return (
    <Modal title="Please confirm" onClose={onCancel}>
      <p>{message}</p>
      <div className="actions">
        <button className="btn ghost" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn danger" onClick={onConfirm} disabled={busy}>
          {busy ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Modal>
  );
}
