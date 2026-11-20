import { useSelector } from "react-redux";

// admin: full access. manager: can view and add, but not edit or delete.
export default function useRole() {
  const role = useSelector((s) => s.auth.user?.role);
  return { role, isAdmin: role === "admin", canEdit: role === "admin" };
}
