import { useState, useCallback } from "react";

const useVideoClient = () => {
	const [client, setClient] = useState<any>(null);

	const initializeClient = useCallback(async (room: string, name: string) => {
		// Initialize your video client here
		// This is a placeholder implementation
		setClient({ room, name });
	}, []);

	const leaveCall = useCallback(async () => {
		// Implement leave call logic here
		setClient(null);
	}, []);

	return { initializeClient, leaveCall };
};

export default useVideoClient;
