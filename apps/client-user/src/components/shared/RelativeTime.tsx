import { formatRelativeTime } from "../../lib/utils";

export function RelativeTime({ date }: { date: Date | number }) {
	return <span>{formatRelativeTime(date)}</span>;
}
