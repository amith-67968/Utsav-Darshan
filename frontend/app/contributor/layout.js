import AuthGate from "../../components/AuthGate";

export default function ContributorLayout({ children }) {
  return <AuthGate>{children}</AuthGate>;
}
