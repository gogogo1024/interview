import * as stylex from "@stylexjs/stylex";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, Flag, MessageSquare, TrendingUp, Users } from "lucide-react";
import { requireAdminAccess } from "../lib/auth-guard";
import { colors, radii, semanticColors, spacing } from "../tokens.stylex";

const styles = stylex.create({
	container: {
		maxWidth: "1400px",
		marginInline: "auto",
		paddingInline: spacing.lg,
		paddingBlock: spacing["2xl"],
	},
	header: {
		marginBottom: spacing["2xl"],
	},
	title: {
		fontSize: "1.5rem",
		fontWeight: 700,
		color: semanticColors.textPrimary,
		marginBottom: spacing.xs,
		letterSpacing: "-0.025em",
	},
	subtitle: {
		color: semanticColors.textSecondary,
		fontSize: "0.875rem",
	},
	statsGrid: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
		gap: spacing.lg,
		marginBottom: spacing["2xl"],
	},
	statCard: {
		backgroundColor: semanticColors.surfaceCard,
		borderRadius: radii.xl,
		padding: spacing.xl,
		border: `1px solid ${semanticColors.borderSubtle}`,
		transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
		backdropFilter: "blur(8px)",
		":hover": {
			borderColor: "rgba(99, 102, 241, 0.3)",
			boxShadow: "0 0 20px rgba(99, 102, 241, 0.08)",
			transform: "translateY(-2px)",
		},
	},
	statHeader: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: spacing.md,
	},
	statLabel: {
		color: semanticColors.textTertiary,
		fontSize: "0.8125rem",
		fontWeight: 500,
	},
	statIcon: {
		width: "2.25rem",
		height: "2.25rem",
		borderRadius: radii.lg,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	statIconBlue: {
		backgroundColor: semanticColors.primaryLight,
		color: colors.blue400,
	},
	statIconGreen: {
		backgroundColor: "rgba(34, 197, 94, 0.12)",
		color: colors.green400,
	},
	statIconPurple: {
		backgroundColor: "rgba(168, 85, 247, 0.12)",
		color: "#c084fc",
	},
	statIconOrange: {
		backgroundColor: "rgba(249, 115, 22, 0.12)",
		color: "#fb923c",
	},
	statValue: {
		fontSize: "1.75rem",
		fontWeight: 700,
		color: semanticColors.textPrimary,
		marginBottom: spacing.xs,
		letterSpacing: "-0.025em",
	},
	statChange: {
		fontSize: "0.75rem",
		display: "flex",
		alignItems: "center",
		gap: "4px",
	},
	statChangePositive: {
		color: colors.green400,
	},
	statChangeNegative: {
		color: colors.red400,
	},
	section: {
		backgroundColor: semanticColors.surfaceCard,
		borderRadius: radii.xl,
		border: `1px solid ${semanticColors.borderSubtle}`,
		marginBottom: spacing.lg,
		backdropFilter: "blur(8px)",
	},
	sectionHeader: {
		padding: spacing.lg,
		borderBottom: `1px solid ${semanticColors.borderSubtle}`,
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
	},
	sectionTitle: {
		fontSize: "1rem",
		fontWeight: 600,
		color: semanticColors.textPrimary,
		letterSpacing: "-0.015em",
	},
	sectionContent: {
		padding: spacing.lg,
	},
	activityList: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.md,
	},
	activityItem: {
		display: "flex",
		alignItems: "flex-start",
		gap: spacing.md,
		paddingBottom: spacing.md,
		borderBottom: `1px solid ${semanticColors.borderSubtle}`,
	},
	activityItemLast: {
		borderBottom: "none",
		paddingBottom: 0,
	},
	activityIcon: {
		width: "2rem",
		height: "2rem",
		borderRadius: radii.lg,
		backgroundColor: semanticColors.primaryLight,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: colors.indigo400,
		flexShrink: 0,
	},
	activityContent: {
		flex: 1,
	},
	activityText: {
		color: semanticColors.textSecondary,
		fontSize: "0.8125rem",
		marginBottom: "4px",
	},
	activityTime: {
		color: semanticColors.textTertiary,
		fontSize: "0.6875rem",
	},
	emptyState: {
		textAlign: "center",
		color: semanticColors.textTertiary,
		paddingBlock: spacing.xl,
		fontSize: "0.875rem",
	},
});

export const Route = createFileRoute("/")({
	beforeLoad: requireAdminAccess,
	component: DashboardPage,
});

function DashboardPage() {
	const stats = [
		{
			label: "Total Users",
			value: "7",
			change: "+3 this week",
			positive: true,
			icon: Users,
			color: "blue",
		},
		{
			label: "Total Posts",
			value: "8",
			change: "+5 today",
			positive: true,
			icon: FileText,
			color: "green",
		},
		{
			label: "Comments",
			value: "8",
			change: "+4 today",
			positive: true,
			icon: MessageSquare,
			color: "purple",
		},
		{
			label: "Pending Reports",
			value: "0",
			change: "All clear",
			positive: true,
			icon: Flag,
			color: "orange",
		},
	];

	const recentActivity = [
		{ text: "New user @diana joined the platform", time: "Just now", icon: Users },
		{ text: "@alice posted about full-stack development", time: "5 minutes ago", icon: FileText },
		{ text: "@bob commented on a post about gRPC", time: "10 minutes ago", icon: MessageSquare },
		{ text: "New user @charlie registered", time: "1 hour ago", icon: Users },
	];

	const getIconStyle = (colorName: string) => {
		switch (colorName) {
			case "blue":
				return styles.statIconBlue;
			case "green":
				return styles.statIconGreen;
			case "purple":
				return styles.statIconPurple;
			case "orange":
				return styles.statIconOrange;
			default:
				return styles.statIconBlue;
		}
	};

	return (
		<main {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<h1 {...stylex.props(styles.title)}>Dashboard</h1>
				<p {...stylex.props(styles.subtitle)}>Overview of Chirp platform activity</p>
			</header>

			<div {...stylex.props(styles.statsGrid)}>
				{stats.map((stat) => {
					const Icon = stat.icon;
					return (
						<div key={stat.label} data-testid="stat-card" {...stylex.props(styles.statCard)}>
							<div {...stylex.props(styles.statHeader)}>
								<span {...stylex.props(styles.statLabel)}>{stat.label}</span>
								<div {...stylex.props(styles.statIcon, getIconStyle(stat.color))}>
									<Icon size={20} />
								</div>
							</div>
							<div {...stylex.props(styles.statValue)}>{stat.value}</div>
							<div
								{...stylex.props(
									styles.statChange,
									stat.positive ? styles.statChangePositive : styles.statChangeNegative,
								)}
							>
								<TrendingUp size={12} />
								{stat.change} from last month
							</div>
						</div>
					);
				})}
			</div>

			<section {...stylex.props(styles.section)}>
				<div {...stylex.props(styles.sectionHeader)}>
					<h2 {...stylex.props(styles.sectionTitle)}>Recent Activity</h2>
				</div>
				<div {...stylex.props(styles.sectionContent)}>
					<div {...stylex.props(styles.activityList)}>
						{recentActivity.map((activity, index) => {
							const Icon = activity.icon;
							const isLast = index === recentActivity.length - 1;
							return (
								<div
									key={`${activity.text}-${index}`}
									{...stylex.props(styles.activityItem, isLast && styles.activityItemLast)}
								>
									<div {...stylex.props(styles.activityIcon)}>
										<Icon size={14} />
									</div>
									<div {...stylex.props(styles.activityContent)}>
										<p {...stylex.props(styles.activityText)}>{activity.text}</p>
										<span {...stylex.props(styles.activityTime)}>{activity.time}</span>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</section>
		</main>
	);
}
