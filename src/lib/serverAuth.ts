import { getAuthSession } from "./auth";

export const getServerAuthSession = async () => {
	return getAuthSession();
};
