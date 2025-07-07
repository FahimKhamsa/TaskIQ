"use client";

import { useState } from "react";
import { User, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileTab } from "./_components/profile-tab";
import { AppearanceTab } from "./_components/appearance-tab";

// Configuration for the settings navigation tabs.
const settingsTabs = [
  { id: "profile", name: "Profile", icon: User },
  { id: "appearance", name: "Appearance", icon: Palette },
];

/**
 * The Settings page for the TaskIQ application.
 * This is a Client Component as it uses state for managing active tabs.
 *
 * @returns {JSX.Element} The settings page component.
 */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="min-h-screen flex">
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-sidebar md:border-r md:border-border p-4 md:p-6 md:min-h-screen">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your account settings
            </p>
          </div>

          <nav className="space-y-2">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  activeTab === tab.id
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "appearance" && <AppearanceTab />}
        </main>
      </div>
    </div>
  );
}
