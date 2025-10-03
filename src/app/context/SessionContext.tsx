"use client";

import { createContext, useContext } from "react";
import { SessionWithExpert } from "@/types/session";

interface SessionContextType {
	session: SessionWithExpert | null;
	total: number;
	basePrice: number;
	participants: number;
	handleBookNow?: () => void;
	updateSession?: (data: Partial<SessionContextType>) => void;
}

export const SessionContext = createContext<SessionContextType>({
	session: null,
	total: 0,
	basePrice: 0,
	participants: 1,
	handleBookNow: () => {},
	updateSession: () => {},
});

export const useSessionContext = () => useContext(SessionContext);
