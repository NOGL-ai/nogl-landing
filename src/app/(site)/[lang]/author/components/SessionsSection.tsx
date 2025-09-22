import React from "react";
import { StayCardData } from "../types";
import ClientSideFilter from "./ClientSideFilter";

interface SessionsSectionProps {
  initialSessions: StayCardData[];
  expertId: string;
}

const SessionsSection = async ({
  initialSessions,
  expertId,
}: SessionsSectionProps) => {
  return (
    <div>
      <div className="listingSection__wrap">
        <ClientSideFilter 
          initialData={initialSessions}
          expertId={expertId}
        />
      </div>
    </div>
  );
};

export default SessionsSection; 