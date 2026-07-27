import * as stylex from "@stylexjs/stylex";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { checkAdminAuth, loginAdmin } from "../server/functions/auth";
import { fontSize, fontWeight, radii, semanticColors, spacing } from "../tokens.stylex";

export const Route = createFileRoute("/login")({
	beforeLoad: async () => {
		// If already logged in as admin, redirect to dashboard
		const { isAuthenticated } = await checkAdminAuth();
		if (isAuthenticated) {
			throw redirect({ to: "/" });
		}
	},
	component: LoginPage,
});

const styles = stylex.create({
	container: {
		minHeight: "100vh",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: semanticColors.bgPrimary,
		padding: spacing.lg,
	},
	card: {
		backgroundColor: semanticColors.surfaceCard,
		borderRadius: radii.xl,
		padding: spacing["2xl"],
		width: "100%",
		maxWidth: "400px",
		boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
	},
	header: {
		textAlign: "center",
		marginBottom: spacing.xl,
	},
	title: {
		fontSize: fontSize["2xl"],
		fontWeight: fontWeight.bold,
		color: semanticColors.textPrimary,
		marginBottom: spacing.xs,
	},
	subtitle: {
		fontSize: fontSize.sm,
		color: semanticColors.textTertiary,
	},
	form: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.md,
	},
	inputGroup: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xs,
	},
	label: {
		fontSize: fontSize.sm,
		fontWeight: fontWeight.medium,
		color: semanticColors.textSecondary,
	},
	input: {
		width: "100%",
		padding: `${spacing.sm} ${spacing.md}`,
		backgroundColor: semanticColors.surfaceInput,
		border: `1px solid ${semanticColors.borderDefault}`,
		borderRadius: radii.lg,
		color: semanticColors.textPrimary,
		fontSize: fontSize.base,
		outline: "none",
		transition: "border-color 0.2s",
		":focus": {
			borderColor: semanticColors.borderFocus,
		},
		"::placeholder": {
			color: semanticColors.textMuted,
		},
	},
	button: {
		width: "100%",
		padding: `${spacing.sm} ${spacing.md}`,
		backgroundColor: semanticColors.primary,
		color: semanticColors.textOnPrimary,
		border: "none",
		borderRadius: radii.lg,
		fontSize: fontSize.base,
		fontWeight: fontWeight.semibold,
		cursor: "pointer",
		transition: "background-color 0.2s",
		marginTop: spacing.sm,
		":hover": {
			backgroundColor: semanticColors.primaryHover,
		},
		":disabled": {
			opacity: 0.6,
			cursor: "not-allowed",
		},
	},
	error: {
		backgroundColor: semanticColors.errorLight,
		border: `1px solid ${semanticColors.error}`,
		borderRadius: radii.md,
		padding: spacing.sm,
		color: semanticColors.error,
		fontSize: fontSize.sm,
		textAlign: "center",
	},
	info: {
		marginTop: spacing.lg,
		padding: spacing.md,
		backgroundColor: semanticColors.bgSecondary,
		borderRadius: radii.md,
		fontSize: fontSize.xs,
		color: semanticColors.textTertiary,
		textAlign: "center",
	},
});

function LoginPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		try {
			await loginAdmin({ data: { email, password } });
			navigate({ to: "/" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.card)}>
				<div {...stylex.props(styles.header)}>
					<h1 {...stylex.props(styles.title)}>Chirp Admin</h1>
					<p {...stylex.props(styles.subtitle)}>Sign in to access the admin dashboard</p>
				</div>

				<form {...stylex.props(styles.form)} onSubmit={handleSubmit}>
					{error && <div {...stylex.props(styles.error)}>{error}</div>}

					<div {...stylex.props(styles.inputGroup)}>
						<label {...stylex.props(styles.label)} htmlFor="email">
							Email
						</label>
						<input
							{...stylex.props(styles.input)}
							id="email"
							name="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="admin@chirp.com"
							required
							autoComplete="email"
						/>
					</div>

					<div {...stylex.props(styles.inputGroup)}>
						<label {...stylex.props(styles.label)} htmlFor="password">
							Password
						</label>
						<input
							{...stylex.props(styles.input)}
							id="password"
							name="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
							required
							autoComplete="current-password"
						/>
					</div>

					<button {...stylex.props(styles.button)} type="submit" disabled={isLoading}>
						{isLoading ? "Signing in..." : "Sign in"}
					</button>
				</form>

				<div {...stylex.props(styles.info)}>
					Only users with admin or moderator roles can access this dashboard.
				</div>
			</div>
		</div>
	);
}
