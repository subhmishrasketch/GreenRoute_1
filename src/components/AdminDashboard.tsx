import { useState } from "react";
import {
  Package, Archive, Recycle, Truck, Building2, TrendingUp, Plus,
  AlertTriangle, CheckCircle2, Clock, Loader2, LayoutDashboard,
  Truck as TruckIcon, MapPin, BarChart3, Calendar, Image, Megaphone, MessageSquare, Zap, UserPlus,
} from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { SocietyLeaderboard } from "@/components/SocietyLeaderboard";
import { EnvironmentalImpact } from "@/components/EnvironmentalImpact";
import { AreaWasteChart } from "@/components/charts/AreaWasteChart";
import { RecyclingChart } from "@/components/charts/RecyclingChart";
import { PickupManagementTable } from "@/components/admin/PickupManagementTable";
import { RealTimeVehicleMap } from "@/components/admin/RealTimeVehicleMap";
import { AdminPickupStats } from "@/components/admin/AdminPickupStats";
import { DriverGPSPanel } from "@/components/admin/DriverGPSPanel";
import { SchedulingCalendar } from "@/components/admin/SchedulingCalendar";
import { GalleryManagement } from "@/components/admin/GalleryManagement";
import { AnnouncementManagement } from "@/components/admin/AnnouncementManagement";
import { ComplaintManagement } from "@/components/admin/ComplaintManagement";
import { DriverManagement } from "@/components/admin/DriverManagement";
import { AutoScheduleToggle } from "@/components/AutoScheduleToggle";
import { AIChatWidget } from "@/components/AIChatWidget";
import { CountUpNumber } from "@/components/CountUpNumber";
import { useAdminPickups } from "@/hooks/useAdminPickups";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { societies, areaWasteData, monthlyRecyclingData, getAdminStats } from "@/data/adminData";

export function AdminDashboard() {
  const stats = getAdminStats();
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ vehicleNumber: "", driverName: "", driverPhone: "" });
  const [addingVehicle, setAddingVehicle] = useState(false);

  const { pickups, vehicles, loading, updatePickupStatus, getStats: getPickupStats, refetchVehicles } = useAdminPickups();
  const pickupStats = getPickupStats();

  const handleAddVehicle = async () => {
    if (!newVehicle.vehicleNumber || !newVehicle.driverName) {
      toast.error("Please fill in vehicle number and driver name");
      return;
    }
    setAddingVehicle(true);
    try {
      const { error } = await supabase.from("vehicles").insert({
        vehicle_number: newVehicle.vehicleNumber,
        driver_name: newVehicle.driverName,
        driver_phone: newVehicle.driverPhone || null,
        status: "available",
      });
      if (error) throw error;
      toast.success("Vehicle added successfully!");
      setNewVehicle({ vehicleNumber: "", driverName: "", driverPhone: "" });
      setAddVehicleOpen(false);
      refetchVehicles();
    } catch (error: any) {
      toast.error(error.message || "Failed to add vehicle");
    } finally {
      setAddingVehicle(false);
    }
  };

  const urgentPickups = pickups.filter(
    (p) => p.status === "requested" && new Date().getTime() - new Date(p.requestedAt).getTime() > 2 * 60 * 60 * 1000
  ).length;
  const availableVehicles = vehicles.filter((v) => v.status === "available").length;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const QuickStatsBar = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-[hsl(var(--warning-amber))]/10 to-[hsl(var(--warning-amber))]/5 border-[hsl(var(--warning-amber))]/20">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[hsl(var(--warning-amber))]/20 flex items-center justify-center"><Clock className="h-5 w-5 text-[hsl(var(--warning-amber))]" /></div>
            <div><p className="text-2xl font-bold text-foreground">{pickupStats.requested}</p><p className="text-xs text-muted-foreground">Pending</p></div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-[hsl(var(--plastic-blue))]/10 to-[hsl(var(--plastic-blue))]/5 border-[hsl(var(--plastic-blue))]/20">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[hsl(var(--plastic-blue))]/20 flex items-center justify-center"><TruckIcon className="h-5 w-5 text-[hsl(var(--plastic-blue))]" /></div>
            <div><p className="text-2xl font-bold text-foreground">{pickupStats.scheduled}</p><p className="text-xs text-muted-foreground">Scheduled</p></div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-[hsl(var(--cardboard-brown))]/10 to-[hsl(var(--cardboard-brown))]/5 border-[hsl(var(--cardboard-brown))]/20">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[hsl(var(--cardboard-brown))]/20 flex items-center justify-center">
              {urgentPickups > 0 ? <AlertTriangle className="h-5 w-5 text-[hsl(var(--cardboard-brown))]" /> : <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success-green))]" />}
            </div>
            <div><p className="text-2xl font-bold text-foreground">{urgentPickups}</p><p className="text-xs text-muted-foreground">Urgent</p></div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-[hsl(var(--success-green))]/10 to-[hsl(var(--success-green))]/5 border-[hsl(var(--success-green))]/20">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[hsl(var(--success-green))]/20 flex items-center justify-center"><Truck className="h-5 w-5 text-[hsl(var(--success-green))]" /></div>
            <div><p className="text-2xl font-bold text-foreground">{availableVehicles}/{vehicles.length}</p><p className="text-xs text-muted-foreground">Available</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const handleSchedulePickup = async (pickupId: string, vehicleId: string, scheduledTime: string, estimatedArrival: string) => {
    await updatePickupStatus(pickupId, "scheduled", vehicleId, new Date(scheduledTime), estimatedArrival);
    toast.success("Pickup scheduled successfully!", { description: `Scheduled for ${new Date(scheduledTime).toLocaleString()}` });
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <Tabs defaultValue="operations" className="w-full">
        <TabsList className="grid w-full max-w-5xl mx-auto grid-cols-9 h-12 p-1 bg-muted/50 backdrop-blur mb-8">
          <TabsTrigger value="operations" className="flex items-center gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
            <TruckIcon className="h-4 w-4" /><span className="hidden lg:inline">Operations</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
            <Calendar className="h-4 w-4" /><span className="hidden lg:inline">Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
            <MapPin className="h-4 w-4" /><span className="hidden lg:inline">Tracking</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
            <BarChart3 className="h-4 w-4" /><span className="hidden lg:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
            <Image className="h-4 w-4" /><span className="hidden lg:inline">Gallery</span>
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex items-center gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
            <Megaphone className="h-4 w-4" /><span className="hidden lg:inline">Announce</span>
          </TabsTrigger>
          <TabsTrigger value="complaints" className="flex items-center gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
            <MessageSquare className="h-4 w-4" /><span className="hidden lg:inline">Complaints</span>
          </TabsTrigger>
          <TabsTrigger value="drivers" className="flex items-center gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
            <UserPlus className="h-4 w-4" /><span className="hidden lg:inline">Drivers</span>
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
            <LayoutDashboard className="h-4 w-4" /><span className="hidden lg:inline">Overview</span>
          </TabsTrigger>
        </TabsList>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-6">
          <QuickStatsBar />
          <div className="flex flex-wrap gap-3 mb-6">
            <Dialog open={addVehicleOpen} onOpenChange={setAddVehicleOpen}>
              <DialogTrigger asChild>
                <Button variant="eco" className="gap-2"><Plus className="h-4 w-4" /> Add Vehicle</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Vehicle</DialogTitle>
                  <DialogDescription>Add a new vehicle to the GreenRoute fleet for waste collection.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                    <Input id="vehicleNumber" placeholder="e.g., MH-04-AB-1234" value={newVehicle.vehicleNumber} onChange={(e) => setNewVehicle({ ...newVehicle, vehicleNumber: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driverName">Driver Name *</Label>
                    <Input id="driverName" placeholder="Enter driver's name" value={newVehicle.driverName} onChange={(e) => setNewVehicle({ ...newVehicle, driverName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driverPhone">Driver Phone (Optional)</Label>
                    <Input id="driverPhone" placeholder="+91 XXXXX XXXXX" value={newVehicle.driverPhone} onChange={(e) => setNewVehicle({ ...newVehicle, driverPhone: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddVehicleOpen(false)}>Cancel</Button>
                  <Button variant="eco" onClick={handleAddVehicle} disabled={addingVehicle}>
                    {addingVehicle ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} Add Vehicle
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="gap-2" onClick={() => refetchVehicles()}><TruckIcon className="h-4 w-4" /> Refresh Fleet</Button>
          </div>
          <AdminPickupStats stats={pickupStats} />
          <div className="mb-6">
            <AutoScheduleToggle vehicles={vehicles} onAutoSchedule={refetchVehicles} />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2"><PickupManagementTable pickups={pickups} vehicles={vehicles} onUpdateStatus={updatePickupStatus} /></div>
            <div className="lg:col-span-1"><DriverGPSPanel vehicles={vehicles} /></div>
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <SchedulingCalendar pickups={pickups} vehicles={vehicles} onSchedulePickup={handleSchedulePickup} />
        </TabsContent>

        {/* Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <RealTimeVehicleMap vehicles={vehicles} pickups={pickups} onRefresh={refetchVehicles} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <AreaWasteChart data={areaWasteData} />
            <RecyclingChart data={monthlyRecyclingData} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <SocietyLeaderboard societies={societies} />
            <EnvironmentalImpact plasticSaved={stats.totalPlastic} co2Reduced={stats.totalCO2Reduced} />
          </div>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-6">
          <GalleryManagement />
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-6">
          <AnnouncementManagement />
        </TabsContent>

        {/* Complaints Tab */}
        <TabsContent value="complaints" className="space-y-6">
          <ComplaintManagement />
        </TabsContent>

        {/* Drivers Tab */}
        <TabsContent value="drivers" className="space-y-6">
          <DriverManagement />
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <StatsCard icon={<TrendingUp className="h-5 w-5 text-primary" />} label="Total Waste" value={`${stats.totalWaste} kg`} />
            <StatsCard icon={<Package className="h-5 w-5 text-plastic" />} label="Plastic" value={`${stats.totalPlastic} kg`} />
            <StatsCard icon={<Archive className="h-5 w-5 text-cardboard" />} label="Cardboard" value={`${stats.totalCardboard} kg`} />
            <StatsCard icon={<Truck className="h-5 w-5 text-primary" />} label="Total Pickups" value={stats.totalPickups} />
            <StatsCard icon={<Building2 className="h-5 w-5 text-recycled" />} label="Societies" value={stats.totalSocieties} />
            <StatsCard icon={<Recycle className="h-5 w-5 text-success" />} label="CO₂ Reduced" value={`${stats.totalCO2Reduced} kg`} trend="+18% this month" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <AreaWasteChart data={areaWasteData} />
            <RecyclingChart data={monthlyRecyclingData} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <SocietyLeaderboard societies={societies} />
            <EnvironmentalImpact plasticSaved={stats.totalPlastic} co2Reduced={stats.totalCO2Reduced} />
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Chat Widget */}
      <AIChatWidget />
    </div>
  );
}
