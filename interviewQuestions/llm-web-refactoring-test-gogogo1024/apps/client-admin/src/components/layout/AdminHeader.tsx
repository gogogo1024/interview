import * as stylex from "@stylexjs/stylex";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import {
	ClipboardList,
	FileText,
	Flag,
	LayoutDashboard,
	LogOut,
	MessageSquare,
	Shield,
	Users,
} from "lucide-react";
import { useAdminUser } from "../../routes/__root";
import { logoutAdmin } from "../../server/functions/auth";
import { colors, radii, semanticColors, spacing } from "../../tokens.stylex";

const styles = stylex.create({
	header: {
		backgroundColor: semanticColors.surfaceOverlay,
		backdropFilter: "blur(20px) saturate(180%)",
		borderBottom: `1px solid ${semanticColors.borderSubtle}`,
		position: "sticky",
		top: 0,
		zIndex: 50,
	},
	container: {
		maxWidth: "1400px",
		marginInline: "auto",
		paddingInline: spacing.lg,
		paddingBlock: "0.625rem",
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
	},
	logoSection: {
		display: "flex",
		alignItems: "center",
		gap: spacing.md,
	},
	logo: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
		textDecoration: "none",
		color: colors.white,
		fontWeight: 800,
		fontSize: "1.125rem",
		letterSpacing: "-0.025em",
	},
	logoIcon: {
		color: colors.indigo400,
	},
	badge: {
		backgroundImage: `linear-gradient(135deg, ${colors.indigo500}, ${colors.blue600})`,
		color: colors.white,
		fontSize: "0.5625rem",
		fontWeight: 700,
		paddingInline: spacing.sm,
		paddingBlock: "2px",
		borderRadius: radii.sm,
		textTransform: "uppercase",
		letterSpacing: "0.08em",
	},
	nav: {
		display: "flex",
		alignItems: "center",
		gap: "2px",
	},
	navLink: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingInline: spacing.md,
		paddingBlock: "0.375rem",
		borderRadius: radii.md,
		textDecoration: "none",
		color: semanticColors.textTertiary,
		fontSize: "0.8125rem",
		fontWeight: 500,
		backgroundColor: "transparent",
		transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
		":hover": {
			backgroundColor: semanticColors.bgHover,
			color: semanticColors.textPrimary,
		},
	},
	navLinkActive: {
		backgroundColor: semanticColors.primaryLight,
		color: colors.indigo400,
	},
	actions: {
		display: "flex",
		alignItems: "center",
		gap: spacing.md,
	},
	logoutButton: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingInline: spacing.md,
		paddingBlock: "0.375rem",
		borderRadius: radii.md,
		border: "none",
		backgroundColor: "transparent",
		color: semanticColors.textSecondary,
		fontSize: "0.8125rem",
		fontWeight: 500,
		cursor: "pointer",
		transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
		":hover": {
			backgroundColor: semanticColors.errorLight,
			color: colors.red400,
		},
	},
	userInfo: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
		color: semanticColors.textTertiary,
		fontSize: "0.8125rem",
	},
	username: {
		fontWeight: 500,
		color: semanticColors.textPrimary,
	},
	roleBadge: {
		backgroundColor: semanticColors.primaryLight,
		color: colors.indigo400,
		fontSize: "0.5625rem",
		fontWeight: 600,
		paddingInline: spacing.sm,
		paddingBlock: "2px",
		borderRadius: radii.sm,
		textTransform: "uppercase",
		letterSpacing: "0.05em",
	},
});

export function AdminHeader() {
	const router = useRouter();
	const navigate = useNavigate();
	const adminUser = useAdminUser();
	const currentPath = router.state.location.pathname;

	const handleLogout = async () => {
		await logoutAdmin();
		navigate({ to: "/login" });
	};

	const navItems = [
		{ to: "/", icon: LayoutDashboard, label: "Dashboard" },
		{ to: "/users", icon: Users, label: "Users" },
		{ to: "/posts", icon: FileText, label: "Posts" },
		{ to: "/comments", icon: MessageSquare, label: "Comments" },
		{ to: "/reports", icon: Flag, label: "Reports" },
		{ to: "/audit", icon: ClipboardList, label: "Audit Log" },
	];

	return (
		<header {...stylex.props(styles.header)}>
			<div {...stylex.props(styles.container)}>
				<div {...stylex.props(styles.logoSection)}>
					<Link to="/" {...stylex.props(styles.logo)}>
						<Shield size={24} {...stylex.props(styles.logoIcon)} />
						Chirp
					</Link>
					<span {...stylex.props(styles.badge)}>Admin</span>
				</div>

				<nav {...stylex.props(styles.nav)}>
					{navItems.map((item) => {
						const Icon = item.icon;
						const isActive = currentPath === item.to;
						return (
							<Link
								key={item.to}
								to={item.to}
								{...stylex.props(styles.navLink, isActive && styles.navLinkActive)}
							>
								<Icon size={16} />
								{item.label}
							</Link>
						);
					})}
				</nav>

				<div {...stylex.props(styles.actions)}>
					{adminUser && (
						<div {...stylex.props(styles.userInfo)}>
							<span {...stylex.props(styles.username)}>{adminUser.username}</span>
							<span {...stylex.props(styles.roleBadge)}>{adminUser.role}</span>
						</div>
					)}
					<button type="button" onClick={handleLogout} {...stylex.props(styles.logoutButton)}>
						<LogOut size={16} />
						Logout
					</button>
				</div>
			</div>
		</header>
	);
}
