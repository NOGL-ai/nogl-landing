// Atomic Design - Organisms
// Complex UI components made of groups of molecules and/or atoms

export { default as Header } from "./Header";
export { default as Footer } from "./MainFooter";
export { default as Sidebar } from "./Sidebar";
// Removed from barrel export to prevent SSR issues with react-instantsearch
// export { default as GlobalSearch } from "./GlobalSearchModal";
export { FeatureSection as Features } from "./Features";
export { default as BackgroundSection } from "./BackgroundSection";
export { default as BioSection } from "./BioSection";
export { default as SectionBecomeAnAuthor } from "./SectionBecomeAnAuthor";
export { default as SectionClientSay } from "./SectionClientSay";
export { default as SectionGridAuthorBox } from "./SectionGridAuthorBox";
export { default as SectionGridCategoryBox } from "./SectionGridCategoryBox";
export { default as SectionHowItWork } from "./SectionHowItWork";
export { default as SectionOurFeatures } from "./SectionOurFeatures";
export { default as SectionSliderNewCategories } from "./SectionSliderNewCategories";
export { default as SectionSubscribe2 } from "./SectionSubscribe2";
export { default as SectionVideos } from "./SectionVideos";
export { ErrorBoundary } from "./ErrorBoundary";
export { default as Testimonials } from "./Testimonials";
export { default as Section } from "./section";
export { default as FAQ } from "./FAQ";
export { default as Pricing } from "./Pricing";
export { default as HomeTestimonials } from "./Testimonials";
export { default as AccountMenu } from "./AccountMenu";
export { default as DashboardHeader } from "./DashboardHeader";
export { default as CommunitySection } from "./CommunitySection";
// Removed HomeBlog from barrel export - it's a server component
// Use direct import: import HomeBlog from "@/components/organisms/HomeBlog"
export { default as HomeCallToAction } from "./HomeCallToAction";
export { default as HomeCounter } from "./HomeCounter";
export { default as HomeFeatureSlideshow } from "./HomeFeatureSlideshow";
export { default as HomeHero } from "./HomeHero";
export { default as HomeNewsletter } from "./HomeNewsletter";
export { default as HomeProblem } from "./HomeProblem";
export { default as HomeSolution } from "./HomeSolution";
export { default as UserProfile } from "./UserProfile";
export { default as MobileSidebar } from "./MobileSidebar";
// Removed from barrel export to prevent SSR issues with react-instantsearch
// export { default as GlobalSearchModal } from "./GlobalSearchModal";
export { default as UltimateProductTable } from "./UltimateProductTable";
export { default as CatalogContent } from "./CatalogContent";
export { default as NotFound } from "./NotFound";
export { default as MonitoredUrlsTable } from "./MonitoredUrlsTable";
export { default as DatafeedSettings } from "./DatafeedSettings";
export { default as Support } from "./Support";
export { default as RepricingRules } from "./RepricingRules";
export { default as Signin } from "./Signin";
export { default as Signup } from "./Signup";
export { default as SignupPageLayout } from "./SignupPageLayout";
export { default as AccountSettings } from "./AccountSettings";
export { default as TokenList } from "./TokenList";
// Removed APIKey from barrel export - it's a server component
// Use direct import: import APIKey from "@/components/organisms/APIKey"
export { default as Billing } from "./Billing";
// Removed PurchaseHistory from barrel export to prevent client-side bundling
// Use direct import: import PurchaseHistory from "@/components/organisms/PurchaseHistory"
export { default as AiIntegration } from "./AiIntegration";
// Removed UsersListContainer from barrel export - it's a server component
// Use direct import: import UsersListContainer from "@/components/organisms/UsersListContainer"
export { default as DashboardPageClient } from "./DashboardPageClient";
export { default as DashboardWidgetGrid } from "./DashboardWidgetGrid";
