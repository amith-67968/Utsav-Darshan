import AuthGate from "../../components/AuthGate";

export default function AdminLayout({ children }) {
  return <AuthGate role="admin">{children}</AuthGate>;
}
