import React from "react";
import Avatar from "@/components/Avatar";
import BioSection from "@/components/BioSection";
import LanguageTag from "@/components/LanguageTag";
import TopicTags from "@/components/TopicTags";
import SocialLinks from "@/components/SocialLinks";

interface SocialLink {
  platform: 'twitter' | 'instagram' | 'youtube' | 'linkedin';
  url: string;
  show?: boolean;
}

interface SidebarProps {
  name: string;
  avatarUrl?: string;
  shortBio?: string;
  longBio?: string;
  languages?: Array<{ name: string; level: string; }>;
  topics?: string[];
  socialLinks?: SocialLink[];
}

const Sidebar = ({ 
  name,
  avatarUrl,
  shortBio = "",
  longBio = "",
  languages = [],
  topics = [],
  socialLinks = []
}: SidebarProps) => {
  return (
    <div className="sticky top-4 flex w-full flex-col items-center space-y-6 rounded-lg bg-neutral-900/95 px-4 py-6 text-center max-h-[calc(100vh-32px)] overflow-y-auto">
      <Avatar src={avatarUrl} alt={name || ""} size={44} hasChecked />
      <h2 className="text-4xl font-bold text-white">{name}</h2>
      <BioSection shortBio={shortBio} longBio={longBio} />
      <LanguageTag languages={languages} />
      <TopicTags topics={topics} />
      {socialLinks.length > 0 && <SocialLinks links={socialLinks} />}
    </div>
  );
};

export default Sidebar; 