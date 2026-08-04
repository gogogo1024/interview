import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Outlet, Scripts, useLocation } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { createContext, useContext } from "react";

import { AdminHeader } from "../components/layout/AdminHeader";
import { getCurrentAdmin } from "../server/functions/auth";

import appCss from "../styles.css?url";

// Admin user type
export interface AdminUser {
	id: string;
	email: string;
	username: string;
	displayName: string;
	avatarUrl?: string;
	role: "admin" | "moderator";
	createdAt: Date;
}

// Context for admin user data
const AdminUserContext = createContext<AdminUser | null>(null);

export function useAdminUser() {
	return useContext(AdminUserContext);
}

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				name: "color-scheme",
				content: "light dark",
			},
			{
				title: "Chirp Admin",
			},
		],
		links: [
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com",
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap",
			},
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "stylesheet",
				href: "/virtual:stylex.css",
			},
		],
	}),

	beforeLoad: async () => {
		// Fetch current admin user (will be null if not authenticated)
		const adminUser = await getCurrentAdmin();
		return { adminUser };
	},

	shellComponent: RootDocument,
});

function RootShell() {
	const { adminUser } = Route.useRouteContext();
	const location = useLocation();

	// Don't show header on login page
	const isLoginPage = location.pathname === "/login";

	return (
		<AdminUserContext.Provider value={adminUser}>
			{!isLoginPage && adminUser && <AdminHeader />}
			<Outlet />
		</AdminUserContext.Provider>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}

// Override the default component to use our shell with context
Route.update({
	component: RootShell,
});
