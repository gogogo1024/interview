import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Ban, Eye, MoreVertical, Search, Shield, User } from "lucide-react";
import { requireAdminAccess } from "../../lib/auth-guard";
import { colors, radii, semanticColors, spacing } from "../../tokens.stylex";

const styles = stylex.create({
	container: {
		maxWidth: "1400px",
		marginInline: "auto",
		paddingInline: spacing.lg,
		paddingBlock: spacing.xl,
	},
	header: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: spacing.xl,
	},
	title: {
		fontSize: "1.875rem",
		fontWeight: 700,
		color: semanticColors.textPrimary,
	},
	searchContainer: {
		position: "relative",
		width: "300px",
	},
	searchIcon: {
		position: "absolute",
		left: spacing.md,
		top: "50%",
		transform: "translateY(-50%)",
		color: semanticColors.textTertiary,
	},
	searchInput: {
		width: "100%",
		paddingBlock: spacing.sm,
		paddingLeft: "40px",
		paddingRight: spacing.md,
		borderRadius: radii.md,
		border: `1px solid ${semanticColors.borderDefault}`,
		backgroundColor: semanticColors.surfaceInput,
		color: semanticColors.textPrimary,
		fontSize: "0.875rem",
		"::placeholder": {
			color: semanticColors.textTertiary,
		},
		":focus": {
			outline: "none",
			borderColor: semanticColors.borderFocus,
		},
	},
	table: {
		width: "100%",
		backgroundColor: semanticColors.surfaceCard,
		borderRadius: radii.lg,
		border: `1px solid ${semanticColors.borderSubtle}`,
		overflow: "hidden",
	},
	tableHeader: {
		backgroundColor: semanticColors.bgSecondary,
	},
	tableRow: {
		borderBottom: `1px solid ${semanticColors.borderSubtle}`,
		":hover": {
			backgroundColor: semanticColors.bgHover,
		},
	},
	tableRowLast: {
		borderBottom: "none",
	},
	th: {
		textAlign: "left",
		padding: spacing.md,
		color: semanticColors.textTertiary,
		fontSize: "0.75rem",
		fontWeight: 600,
		textTransform: "uppercase",
		letterSpacing: "0.05em",
	},
	td: {
		padding: spacing.md,
		color: semanticColors.textSecondary,
		fontSize: "0.875rem",
	},
	userCell: {
		display: "flex",
		alignItems: "center",
		gap: spacing.md,
	},
	avatar: {
		width: "40px",
		height: "40px",
		borderRadius: "50%",
		backgroundColor: semanticColors.bgSecondary,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: semanticColors.textTertiary,
	},
	avatarImg: {
		width: "40px",
		height: "40px",
		borderRadius: "50%",
		objectFit: "cover",
	},
	userInfo: {
		display: "flex",
		flexDirection: "column",
	},
	userName: {
		color: semanticColors.textPrimary,
		fontWeight: 500,
	},
	userHandle: {
		color: semanticColors.textTertiary,
		fontSize: "0.75rem",
	},
	badge: {
		display: "inline-flex",
		alignItems: "center",
		paddingInline: spacing.sm,
		paddingBlock: "2px",
		borderRadius: radii.full,
		fontSize: "0.75rem",
		fontWeight: 500,
	},
	badgeUser: {
		backgroundColor: colors.slate700,
		color: colors.slate300,
	},
	badgeModerator: {
		backgroundColor: colors.blue900,
		color: colors.blue400,
	},
	badgeAdmin: {
		backgroundColor: "#581c87",
		color: "#c084fc",
	},
	badgeBanned: {
		backgroundColor: colors.red900,
		color: colors.red400,
	},
	statusActive: {
		color: colors.green400,
	},
	statusBanned: {
		color: colors.red400,
	},
	actionsCell: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
	},
	actionButton: {
		padding: spacing.sm,
		borderRadius: radii.md,
		border: "none",
		backgroundColor: "transparent",
		color: semanticColors.textTertiary,
		cursor: "pointer",
		":hover": {
			backgroundColor: semanticColors.bgHover,
			color: semanticColors.textPrimary,
		},
	},
	viewLink: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		padding: spacing.sm,
		borderRadius: radii.md,
		textDecoration: "none",
		color: semanticColors.textTertiary,
		":hover": {
			backgroundColor: semanticColors.bgHover,
			color: semanticColors.textPrimary,
		},
	},
});

export const Route = createFileRoute("/users/")({
	beforeLoad: requireAdminAccess,
	component: UsersPage,
});

const mockUsers = [
	{
		id: "1",
		username: "alice",
		displayName: "Alice Johnson",
		email: "alice@test.com",
		avatarUrl: null,
		role: "user" as const,
		status: "active" as const,
		postCount: 3,
		joinedAt: "2026-01-28",
	},
	{
		id: "2",
		username: "bob",
		displayName: "Bob Smith",
		email: "bob@test.com",
		avatarUrl: null,
		role: "user" as const,
		status: "active" as const,
		postCount: 2,
		joinedAt: "2026-01-28",
	},
	{
		id: "3",
		username: "charlie",
		displayName: "Charlie Brown",
		email: "charlie@test.com",
		avatarUrl: null,
		role: "user" as const,
		status: "active" as const,
		postCount: 2,
		joinedAt: "2026-01-28",
	},
	{
		id: "4",
		username: "diana",
		displayName: "Diana Ross",
		email: "diana@test.com",
		avatarUrl: null,
		role: "user" as const,
		status: "active" as const,
		postCount: 2,
		joinedAt: "2026-01-29",
	},
	{
		id: "5",
		username: "admin",
		displayName: "Admin User",
		email: "admin@chirp.test",
		avatarUrl: null,
		role: "admin" as const,
		status: "active" as const,
		postCount: 0,
		joinedAt: "2026-01-27",
	},
	{
		id: "6",
		username: "moderator",
		displayName: "Moderator User",
		email: "moderator@chirp.test",
		avatarUrl: null,
		role: "moderator" as const,
		status: "active" as const,
		postCount: 0,
		joinedAt: "2026-01-27",
	},
];

function UsersPage() {
	const getRoleBadgeStyle = (role: string) => {
		switch (role) {
			case "admin":
				return styles.badgeAdmin;
			case "moderator":
				return styles.badgeModerator;
			default:
				return styles.badgeUser;
		}
	};

	const getRoleIcon = (role: string) => {
		switch (role) {
			case "admin":
				return Shield;
			case "moderator":
				return Shield;
			default:
				return User;
		}
	};

	return (
		<main {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<h1 {...stylex.props(styles.title)}>Users</h1>
				<div {...stylex.props(styles.searchContainer)}>
					<Search size={16} {...stylex.props(styles.searchIcon)} />
					<input type="text" placeholder="Search users..." {...stylex.props(styles.searchInput)} />
				</div>
			</header>

			<table {...stylex.props(styles.table)}>
				<thead {...stylex.props(styles.tableHeader)}>
					<tr>
						<th {...stylex.props(styles.th)}>User</th>
						<th {...stylex.props(styles.th)}>Email</th>
						<th {...stylex.props(styles.th)}>Role</th>
						<th {...stylex.props(styles.th)}>Status</th>
						<th {...stylex.props(styles.th)}>Posts</th>
						<th {...stylex.props(styles.th)}>Joined</th>
						<th {...stylex.props(styles.th)}>Actions</th>
					</tr>
				</thead>
				<tbody>
					{mockUsers.map((user, index) => {
						const isLast = index === mockUsers.length - 1;
						const RoleIcon = getRoleIcon(user.role);
						return (
							<tr key={user.id} {...stylex.props(styles.tableRow, isLast && styles.tableRowLast)}>
								<td {...stylex.props(styles.td)}>
									<div {...stylex.props(styles.userCell)}>
										<div {...stylex.props(styles.avatar)}>
											{user.avatarUrl ? (
												<img
													src={user.avatarUrl}
													alt={user.displayName}
													{...stylex.props(styles.avatarImg)}
												/>
											) : (
												<User size={20} />
											)}
										</div>
										<div {...stylex.props(styles.userInfo)}>
											<span {...stylex.props(styles.userName)}>{user.displayName}</span>
											<span {...stylex.props(styles.userHandle)}>@{user.username}</span>
										</div>
									</div>
								</td>
								<td {...stylex.props(styles.td)}>{user.email}</td>
								<td {...stylex.props(styles.td)}>
									<span {...stylex.props(styles.badge, getRoleBadgeStyle(user.role))}>
										<RoleIcon size={12} style={{ marginRight: "4px" }} />
										{user.role}
									</span>
								</td>
								<td {...stylex.props(styles.td)}>
									<span
										{...stylex.props(
											user.status === "active" ? styles.statusActive : styles.statusBanned,
										)}
									>
										{user.status === "banned" ? "Banned" : "Active"}
									</span>
								</td>
								<td {...stylex.props(styles.td)}>{user.postCount}</td>
								<td {...stylex.props(styles.td)}>{user.joinedAt}</td>
								<td {...stylex.props(styles.td)}>
									<div {...stylex.props(styles.actionsCell)}>
										<Link
											to="/users/$userId"
											params={{ userId: user.id }}
											{...stylex.props(styles.viewLink)}
										>
											<Eye size={16} />
										</Link>
										<button type="button" {...stylex.props(styles.actionButton)}>
											<Ban size={16} />
										</button>
										<button type="button" {...stylex.props(styles.actionButton)}>
											<MoreVertical size={16} />
										</button>
									</div>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</main>
	);
}
