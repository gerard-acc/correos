import type { ReactNode } from "react";
import "./tabs.css";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface Tabs {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function Tabs({ tabs, activeTab, onTabChange }: Tabs) {
  return (
    <div>
      <div className="tabs">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            className={`tabs__tab ${tabItem.id === activeTab ? "active" : ""}`}
            onClick={() => onTabChange(tabItem.id)}
          >
            {tabItem.label}
          </button>
        ))}
      </div>
      <div className="tabContent">
        {tabs.find((tabItem) => tabItem.id === activeTab)?.content}
      </div>
    </div>
  );
}
