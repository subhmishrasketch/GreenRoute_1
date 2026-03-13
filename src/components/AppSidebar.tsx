import { Trophy, Package, MapPin, History, Camera, MessageSquare, Image, PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: "request", icon: PlusCircle, labelKey: "new_pickup" },
  { id: "scanner", icon: Camera, labelKey: "scanner" },
  { id: "tracking", icon: MapPin, labelKey: "tracking" },
  { id: "history", icon: History, labelKey: "history" },
  { id: "gallery", icon: Image, labelKey: "gallery" },
  { id: "feedback", icon: MessageSquare, labelKey: "feedback" },
];

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const { t } = useTranslation();

  const handleTabClick = (id: string) => {
    onTabChange(id);
    toggleSidebar(); // close sidebar after selection
  };

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-border bg-sidebar top-16 h-[calc(100vh-4rem)]">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{!collapsed ? t("quick_actions") : ""}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleTabClick(item.id)}
                    className={cn(
                      "cursor-pointer transition-colors",
                      activeTab === item.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="ml-2">{t(item.labelKey)}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
