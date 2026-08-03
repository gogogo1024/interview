import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
	return clsx(inputs);
}

// Format relative time
export function formatRelativeTime(date: Date | number): string {
	const now = new Date();
	const then = typeof date === "number" ? new Date(date * 1000) : date;
	const diffMs = now.getTime() - then.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);

	if (diffSec < 60) return "just now";
	if (diffMin < 60) return `${diffMin}m ago`;
	if (diffHour < 24) return `${diffHour}h ago`;
	if (diffDay < 7) return `${diffDay}d ago`;

	return then.toLocaleDateString();
}
