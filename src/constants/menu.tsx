import React, { lazy } from "react";
import { Home, SwitchCamera, Info, Settings, FileText, RadioReceiverIcon } from "lucide-react";

// Lazy-loaded pages
const CalendarPage = lazy(() => import("../pages/CalendarPage"));
const ConverterPage = lazy(() => import("../pages/ConverterPage"));
const KundaliPage = lazy(() => import("../pages/KundaliPage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const AboutPage = lazy(() => import("../pages/AboutPopup"));
const PrivacyPage = lazy(() => import("../pages/PrivacyPage"));
const radioPage = lazy(() => import("../pages/radioPage"));

export interface MenuItem {
  key: string;                                      // Unique identifier
  label: string;                                    // Nepali label
  icon?: React.ReactNode;                           // Optional icon
  page?: React.LazyExoticComponent<React.FC<any>>; // Linked lazy-loaded page
  fixed?: boolean;                                  // Show in tab/top menu if true
}

// Menu items
export const MENU_ITEMS: MenuItem[] = [
  {
    key: "calendar",
    label: "गृहपृष्ठ",
    icon: <Home className="w-5 h-5" />,
    page: CalendarPage,
    fixed: true,
  },
  {
    key: "converter",
    label: "मिति रूपान्तरण",
    icon: <SwitchCamera className="w-5 h-5" />,
    page: ConverterPage,
    fixed: true,
  },
  {
    key: "kundali",
    label: "कुण्डली",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2v20M2 12h20" />
      </svg>
    ),
    page: KundaliPage,
    fixed: true,
  },
  {
    key: "settings",
    label: "सेटिङ",
    icon: <Settings className="w-5 h-5" />,
    page: SettingsPage,
    fixed: true,
  },
  {
    key: "about",
    label: "बारेमा",
    icon: <Info className="w-5 h-5" />,
    page: AboutPage,
    fixed: false,
  },
  {
    key: "privacy",
    label: "गोपनीयता नीति",
    icon: <FileText className="w-5 h-5" />,
    page: PrivacyPage,
    fixed: false,
  },
	{
    key: "radio",
    label: "रेडियो",
    icon: <RadioReceiverIcon className="w-5 h-5" />,
    page: radioPage,
    fixed: false,
  },
	// Template
	/*{
    key: "menu",
    label: "मेनु",
    icon: <MenuIcon className="w-5 h-5" />,
    page: menuPage,
    fixed: false,
  },*/
];
