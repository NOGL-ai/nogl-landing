import { getAuthSession } from "./auth";

export const isAuthorized = async () => {
	const session = await getAuthSession();
	return session?.user;
};
