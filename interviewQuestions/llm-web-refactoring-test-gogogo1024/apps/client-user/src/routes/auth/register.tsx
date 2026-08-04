import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, AtSign, Lock, Mail, MessageCircle, User } from "lucide-react";
import { useState } from "react";
import { registerUser } from "../../server/functions/auth";
import { colors, fontSize, fontWeight, radii, semanticColors, spacing } from "../../tokens.stylex";

export const Route = createFileRoute("/auth/register")({
	component: RegisterPage,
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
			backgroundImage: `linear-gradient(145deg, ${colors.purple600}, ${colors.indigo500}, ${colors.blue600})`,
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
		color: "rgba(233, 213, 255, 0.85)",
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
		maxWidth: "28rem",
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
		backgroundImage: `linear-gradient(135deg, ${colors.purple600}, ${colors.indigo500})`,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		boxShadow: "0 8px 24px -4px rgba(124, 58, 237, 0.3)",
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
		gap: spacing.lg,
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
	gridRow: {
		display: "grid",
		gridTemplateColumns: "1fr 1fr",
		gap: spacing.lg,
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
		backgroundImage: `linear-gradient(135deg, ${colors.purple600}, ${colors.indigo500})`,
		color: colors.white,
		fontWeight: fontWeight.semibold,
		borderRadius: radii.xl,
		border: "none",
		cursor: "pointer",
		transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
		boxShadow: "0 4px 14px -2px rgba(124, 58, 237, 0.3)",
		marginTop: spacing.sm,
		":hover": {
			boxShadow: "0 8px 20px -2px rgba(124, 58, 237, 0.4)",
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
	signInLink: {
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

function RegisterPage() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		email: "",
		username: "",
		displayName: "",
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (formData.password.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}

		setLoading(true);

		try {
			await registerUser({
				data: {
					email: formData.email,
					username: formData.username,
					displayName: formData.displayName,
					password: formData.password,
				},
			});
			navigate({ to: "/" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Registration failed");
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
					<h1 {...stylex.props(styles.brandingTitle)}>Join Chirp</h1>
					<p {...stylex.props(styles.brandingSubtitle)}>
						Start sharing your thoughts and connect with amazing people today.
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
						<h2 {...stylex.props(styles.heading)}>Create account</h2>
						<p {...stylex.props(styles.subheading)}>Fill in your details to get started</p>

						<form onSubmit={handleSubmit} {...stylex.props(styles.form)}>
							{error && (
								<div {...stylex.props(styles.errorBox)}>
									<AlertCircle size={20} {...stylex.props(styles.errorIconShrink)} />
									{error}
								</div>
							)}

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
										required
										{...stylex.props(styles.input)}
										placeholder="you@example.com"
										value={formData.email}
										onChange={(e) => setFormData({ ...formData, email: e.target.value })}
									/>
								</div>
							</div>

							<div {...stylex.props(styles.gridRow)}>
								<div>
									<label htmlFor="username" {...stylex.props(styles.label)}>
										Username
									</label>
									<div {...stylex.props(styles.inputWrapper)}>
										<div {...stylex.props(styles.inputIconWrapper)}>
											<AtSign size={20} {...stylex.props(styles.inputIcon)} />
										</div>
										<input
											id="username"
											name="username"
											type="text"
											required
											{...stylex.props(styles.input)}
											placeholder="username"
											value={formData.username}
											onChange={(e) => setFormData({ ...formData, username: e.target.value })}
										/>
									</div>
								</div>

								<div>
									<label htmlFor="displayName" {...stylex.props(styles.label)}>
										Display Name
									</label>
									<div {...stylex.props(styles.inputWrapper)}>
										<div {...stylex.props(styles.inputIconWrapper)}>
											<User size={20} {...stylex.props(styles.inputIcon)} />
										</div>
										<input
											id="displayName"
											name="displayName"
											type="text"
											required
											{...stylex.props(styles.input)}
											placeholder="Your Name"
											value={formData.displayName}
											onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
										/>
									</div>
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
										required
										{...stylex.props(styles.input)}
										placeholder="••••••••"
										value={formData.password}
										onChange={(e) => setFormData({ ...formData, password: e.target.value })}
									/>
								</div>
							</div>

							<div>
								<label htmlFor="confirmPassword" {...stylex.props(styles.label)}>
									Confirm Password
								</label>
								<div {...stylex.props(styles.inputWrapper)}>
									<div {...stylex.props(styles.inputIconWrapper)}>
										<Lock size={20} {...stylex.props(styles.inputIcon)} />
									</div>
									<input
										id="confirmPassword"
										name="confirmPassword"
										type="password"
										required
										{...stylex.props(styles.input)}
										placeholder="••••••••"
										value={formData.confirmPassword}
										onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
									/>
								</div>
							</div>

							<button type="submit" disabled={loading} {...stylex.props(styles.submitButton)}>
								{loading ? (
									<>
										<div {...stylex.props(styles.spinner)} />
										Creating account...
									</>
								) : (
									<>
										Create account
										<ArrowRight size={20} />
									</>
								)}
							</button>
						</form>

						<div {...stylex.props(styles.footer)}>
							<p {...stylex.props(styles.footerText)}>
								Already have an account?{" "}
								<Link to="/auth/login" {...stylex.props(styles.signInLink)}>
									Sign in
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
