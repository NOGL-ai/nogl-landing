import { authOptions } from "./auth";
import { getServerSession } from "next-auth";

export const getServerAuthSession = async () => {
	return getServerSession(authOptions);
};
