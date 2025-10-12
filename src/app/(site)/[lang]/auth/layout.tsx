import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
	// Simple passthrough layout - no footer for auth pages
	return <>{children}</>;
}
