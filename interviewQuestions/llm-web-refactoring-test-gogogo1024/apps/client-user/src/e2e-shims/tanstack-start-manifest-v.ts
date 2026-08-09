export function tsrStartManifest() {
	return {
		clientEntry: "/src/main.tsx",
		routes: {
			root: { assets: [], preloads: [] },
		},
	};
}
