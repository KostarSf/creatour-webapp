import { useFetchers, useNavigation } from "react-router";

const GlobalPendingIndicator = () => {
	const navigation = useNavigation();
	const fetchers = useFetchers();

	const pending = navigation.state !== "idle" || fetchers.length > 0;

	return (
		<div className="fixed top-0 right-0 left-0 z-20" style={{ display: pending ? "block" : "none" }}>
			<div className="h-0.5 w-full overflow-hidden bg-muted">
				<div className="h-full w-full origin-left-right animate-progress bg-muted-foreground" />
			</div>
		</div>
	);
};

export { GlobalPendingIndicator };
