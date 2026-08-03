import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, Lock, Mail, MessageCircle } from "lucide-react";
import { useState } from "react";
import { loginUser } from "../../server/functions/auth";
import { colors, fontSize, fontWeight, radii, semanticColors, spacing } from "../../tokens.stylex";

export const Route = createFileRoute("/auth/login")({
	component: LoginPage,
});

const styles = stylex.create({
	wrapper: {
		minHeight: "100vh",
		display: "flex",
	},
	brandingSide: {
		display: "none",
		"@media (min-width: 1024px)": {
			display: "flex",
			width: "50%",
			backgroundImage: `linear-gradient(145deg, ${colors.indigo500}, ${colors.blue600}, ${colors.purple600})`,
			padding: spacing["3xl"],
			alignItems: "center",
			justifyContent: "center",
			position: "relative",
			overflow: "hidden",
		},
	},
	brandingOverlay: {
		position: "absolute",
		inset: 0,
		backgroundImage:
			"url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')",
		opacity: 0.4,
	},
	brandingContent: {
		position: "relative",
		zIndex: 10,
		textAlign: "center",
		color: colors.white,
	},
	brandingLogo: {
		width: "5.5rem",
		height: "5.5rem",
		borderRadius: "1.25rem",
		backgroundColor: "rgba(255, 255, 255, 0.15)",
		backdropFilter: "blur(16px)",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		marginLeft: "auto",
		marginRight: "auto",
		marginBottom: spacing["3xl"],
		boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
		border: "1px solid rgba(255, 255, 255, 0.18)",
	},
	brandingTitle: {
		fontSize: fontSize["4xl"],
		fontWeight: fontWeight.bold,
		marginBottom: spacing.md,
		color: colors.white,
		letterSpacing: "-0.025em",
	},
	brandingSubtitle: {
		fontSize: fontSize.lg,
		color: "rgba(224, 231, 255, 0.85)",
		maxWidth: "24rem",
		lineHeight: "1.6",
	},
	formSide: {
		flex: 1,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		padding: spacing["3xl"],
		backgroundColor: semanticColors.bgPrimary,
	},
	formContainer: {
		width: "100%",
		maxWidth: "26rem",
	},
	mobileLogo: {
		display: "flex",
		justifyContent: "center",
		marginBottom: spacing["3xl"],
		"@media (min-width: 1024px)": {
			display: "none",
		},
	},
	mobileLogoIcon: {
		width: "3.5rem",
		height: "3.5rem",
		borderRadius: radii.xl,
		backgroundImage: `linear-gradient(135deg, ${colors.indigo500}, ${colors.purple600})`,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		boxShadow: "0 8px 24px -4px rgba(99, 102, 241, 0.3)",
	},
	card: {
		backgroundColor: semanticColors.surfaceCard,
		borderRadius: "1.25rem",
		boxShadow: "0 4px 24px -4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.03)",
		padding: spacing["3xl"],
	},
	heading: {
		fontSize: fontSize["2xl"],
		fontWeight: fontWeight.bold,
		color: semanticColors.textPrimary,
		marginBottom: spacing.xs,
		letterSpacing: "-0.025em",
	},
	subheading: {
		color: semanticColors.textSecondary,
		marginBottom: spacing["2xl"],
		fontSize: fontSize.sm,
	},
	form: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xl,
	},
	errorBox: {
		display: "flex",
		alignItems: "center",
		gap: spacing.md,
		padding: spacing.md,
		backgroundColor: semanticColors.errorBg,
		color: semanticColors.error,
		borderRadius: radii.lg,
		fontSize: fontSize.sm,
		border: `1px solid ${semanticColors.errorBorder}`,
	},
	errorIconShrink: {
		flexShrink: 0,
	},
	fieldGroup: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.lg,
	},
	label: {
		display: "block",
		fontSize: fontSize.sm,
		fontWeight: fontWeight.medium,
		color: semanticColors.textSecondary,
		marginBottom: spacing.xs,
	},
	inputWrapper: {
		position: "relative",
	},
	inputIconWrapper: {
		position: "absolute",
		top: 0,
		bottom: 0,
		left: 0,
		paddingLeft: spacing.md,
		display: "flex",
		alignItems: "center",
		pointerEvents: "none",
	},
	inputIcon: {
		color: semanticColors.textTertiary,
	},
	input: {
		display: "block",
		width: "100%",
		paddingLeft: "2.75rem",
		paddingRight: spacing.lg,
		paddingTop: "0.625rem",
		paddingBottom: "0.625rem",
		border: `1.5px solid ${semanticColors.borderDefault}`,
		borderRadius: radii.lg,
		fontSize: fontSize.sm,
		outline: "none",
		transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
		boxSizing: "border-box",
		backgroundColor: semanticColors.surfaceInput,
		":focus": {
			borderColor: colors.indigo500,
			boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
			backgroundColor: colors.white,
		},
	},
	submitButton: {
		width: "100%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.sm,
		paddingTop: "0.75rem",
		paddingBottom: "0.75rem",
		paddingLeft: spacing["2xl"],
		paddingRight: spacing["2xl"],
		fontSize: fontSize.sm,
		backgroundImage: `linear-gradient(135deg, ${colors.indigo500}, ${colors.blue600})`,
		color: colors.white,
		fontWeight: fontWeight.semibold,
		borderRadius: radii.xl,
		border: "none",
		cursor: "pointer",
		transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
		boxShadow: "0 4px 14px -2px rgba(99, 102, 241, 0.3)",
		":hover": {
			boxShadow: "0 8px 20px -2px rgba(99, 102, 241, 0.4)",
			transform: "translateY(-1px)",
		},
		":disabled": {
			opacity: 0.5,
			cursor: "not-allowed",
			transform: "none",
		},
	},
	spinner: {
		width: "1.125rem",
		height: "1.125rem",
		border: "2px solid rgba(255, 255, 255, 0.3)",
		borderTopColor: colors.white,
		borderRadius: radii.full,
		animationName: stylex.keyframes({
			"0%": { transform: "rotate(0deg)" },
			"100%": { transform: "rotate(360deg)" },
		}),
		animationDuration: "0.6s",
		animationIterationCount: "infinite",
		animationTimingFunction: "linear",
	},
	footer: {
		marginTop: spacing["2xl"],
		textAlign: "center",
	},
	footerText: {
		color: semanticColors.textSecondary,
		fontSize: fontSize.sm,
	},
	signUpLink: {
		display: "inline-flex",
		alignItems: "center",
		gap: spacing.xs,
		color: colors.indigo500,
		fontWeight: fontWeight.semibold,
		textDecoration: "none",
		paddingLeft: spacing.xs,
		":hover": {
			color: colors.indigo600,
		},
	},
	iconWhite: {
		color: colors.white,
	},
});

function LoginPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			await loginUser({ data: { email, password } });
			navigate({ to: "/" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div {...stylex.props(styles.wrapper)}>
			{/* Left side - Branding */}
			<div {...stylex.props(styles.brandingSide)}>
				<div {...stylex.props(styles.brandingOverlay)} />
				<div {...stylex.props(styles.brandingContent)}>
					<div {...stylex.props(styles.brandingLogo)}>
						<MessageCircle size={48} {...stylex.props(styles.iconWhite)} />
					</div>
					<h1 {...stylex.props(styles.brandingTitle)}>Chirp</h1>
					<p {...stylex.props(styles.brandingSubtitle)}>
						Connect with friends and share what's happening in your world.
					</p>
				</div>
			</div>

			{/* Right side - Form */}
			<div {...stylex.props(styles.formSide)}>
				<div {...stylex.props(styles.formContainer)}>
					{/* Mobile logo */}
					<div {...stylex.props(styles.mobileLogo)}>
						<div {...stylex.props(styles.mobileLogoIcon)}>
							<MessageCircle size={32} {...stylex.props(styles.iconWhite)} />
						</div>
					</div>

					<div {...stylex.props(styles.card)}>
						<h2 {...stylex.props(styles.heading)}>Welcome back</h2>
						<p {...stylex.props(styles.subheading)}>Sign in to continue to Chirp</p>

						<form onSubmit={handleSubmit} {...stylex.props(styles.form)}>
							{error && (
								<div {...stylex.props(styles.errorBox)}>
									<AlertCircle size={20} {...stylex.props(styles.errorIconShrink)} />
									{error}
								</div>
							)}

							<div {...stylex.props(styles.fieldGroup)}>
								<div>
									<label htmlFor="email" {...stylex.props(styles.label)}>
										Email address
									</label>
									<div {...stylex.props(styles.inputWrapper)}>
										<div {...stylex.props(styles.inputIconWrapper)}>
											<Mail size={20} {...stylex.props(styles.inputIcon)} />
										</div>
										<input
											id="email"
											name="email"
											type="email"
											autoComplete="email"
											required
											{...stylex.props(styles.input)}
											placeholder="you@example.com"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
										/>
									</div>
								</div>

								<div>
									<label htmlFor="password" {...stylex.props(styles.label)}>
										Password
									</label>
									<div {...stylex.props(styles.inputWrapper)}>
										<div {...stylex.props(styles.inputIconWrapper)}>
											<Lock size={20} {...stylex.props(styles.inputIcon)} />
										</div>
										<input
											id="password"
											name="password"
											type="password"
											autoComplete="current-password"
											required
											{...stylex.props(styles.input)}
											placeholder="••••••••"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
										/>
									</div>
								</div>
							</div>

							<button type="submit" disabled={loading} {...stylex.props(styles.submitButton)}>
								{loading ? (
									<>
										<div {...stylex.props(styles.spinner)} />
										Signing in...
									</>
								) : (
									<>
										Sign in
										<ArrowRight size={20} />
									</>
								)}
							</button>
						</form>

						<div {...stylex.props(styles.footer)}>
							<p {...stylex.props(styles.footerText)}>
								Don't have an account?{" "}
								<Link to="/auth/register" {...stylex.props(styles.signUpLink)}>
									Sign up
									<ArrowRight size={16} />
								</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
