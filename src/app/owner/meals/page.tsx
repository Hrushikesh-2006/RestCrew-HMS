"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  Plus,
  Users,
  Check,
  Calendar,
  Coffee,
  Sun,
  Moon,
  Edit2,
  Trash2,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { requestJson } from "@/lib/api-client";
import { AuthGuard } from "@/components/shared/auth-guard";
import { OwnerLayout } from "@/components/owner/owner-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMealLiveUpdates } from "@/hooks/use-meal-live-updates";

type MealType = "breakfast" | "lunch" | "dinner";

type OwnerMeal = {
  id: string;
  date: string;
  type: MealType;
  menu: string[];
  timing: string;
  attendingCount: number;
  totalPossible: number;
};

type OwnerMealsResponse = {
  meals: OwnerMeal[];
  totalPossible: number;
  studentIds: string[];
};

type MealForm = Omit<OwnerMeal, "id" | "attendingCount" | "totalPossible">;

const mealTypes = [
  {
    id: "breakfast" as const,
    label: "Breakfast",
    icon: Coffee,
    time: "7:00 AM - 9:00 AM",
  },
  { id: "lunch" as const, label: "Lunch", icon: Sun, time: "12:00 PM - 2:00 PM" },
  { id: "dinner" as const, label: "Dinner", icon: Moon, time: "7:00 PM - 9:00 PM" },
];

export default function OwnerMealsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { owner, isAuthenticated, userType, hasHydrated } = useAuthStore();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA"),
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<OwnerMeal | null>(null);
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [menuItems, setMenuItems] = useState("");
  const [timing, setTiming] = useState("7:00 AM - 9:00 AM");
  const [shouldNotify, setShouldNotify] = useState(true);
  const [dbMeals, setDbMeals] = useState<OwnerMeal[]>([]);
  const [dbTotalStudents, setDbTotalStudents] = useState(0);
  const [dbStudentIds, setDbStudentIds] = useState<string[]>([]);

  const loadMeals = async () => {
    if (!owner?.id) {
      return;
    }

    try {
      const data = await requestJson<OwnerMealsResponse>(
        `/api/owner/${owner.id}/meals?date=${selectedDate}`,
      );
      setDbMeals(data.meals ?? []);
      setDbTotalStudents(data.totalPossible ?? 0);
      setDbStudentIds(data.studentIds ?? []);
    } catch (error) {
      console.error("Failed to load meals from DB", error);
    }
  };

  useMealLiveUpdates({
    ownerId: owner?.id,
    onMealUpdate: loadMeals,
    enabled: Boolean(owner?.id),
  });

  useEffect(() => {
    void loadMeals();
  }, [owner?.id, selectedDate]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated || userType !== "owner") {
      router.push("/owner/login");
    }
  }, [hasHydrated, isAuthenticated, userType, router]);

  if (!hasHydrated || !owner) return null;

  const getMealByType = (type: MealType) => {
    return dbMeals.find((meal) => meal.type === type) ?? null;
  };

  const resetForm = () => {
    setEditingMeal(null);
    setMealType("breakfast");
    setMenuItems("");
    setTiming("7:00 AM - 9:00 AM");
    setShouldNotify(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const menu = menuItems
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const mealData: MealForm = {
      date: selectedDate,
      type: mealType,
      menu,
      timing,
    };

    try {
      if (editingMeal) {
        await requestJson(`/api/owner/${owner.id}/meals`, {
          method: "PATCH",
          body: JSON.stringify({
            mealId: editingMeal.id,
            ...mealData,
          }),
        });

        toast({
          title: "Meal Updated",
          description: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} has been updated.`,
        });
      } else {
        await requestJson(`/api/owner/${owner.id}/meals`, {
          method: "POST",
          body: JSON.stringify(mealData),
        });

        toast({
          title: "Meal Added",
          description: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} has been added.`,
        });
      }

      if (shouldNotify && dbStudentIds.length > 0) {
        await requestJson("/api/notifications", {
          method: "POST",
          body: JSON.stringify({
            studentIds: dbStudentIds,
            ownerId: owner.id,
            type: "Meal",
            title: editingMeal ? "Meal Plan Updated" : "New Meal Plan Added",
            message: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} for ${selectedDate}: ${menu.join(", ")}`,
          }),
        });
      }

      resetForm();
      setIsDialogOpen(false);
      await loadMeals();
    } catch (error) {
      toast({
        title: "Unable to save meal",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (meal: OwnerMeal) => {
    setEditingMeal(meal);
    setMealType(meal.type);
    setMenuItems(meal.menu.join(", "));
    setTiming(meal.timing);
    setSelectedDate(meal.date);
    setIsDialogOpen(true);
  };

  const handleDelete = async (meal: OwnerMeal) => {
    try {
      await requestJson(`/api/owner/${owner.id}/meals`, {
        method: "DELETE",
        body: JSON.stringify({ mealId: meal.id }),
      });

      toast({
        title: "Meal Deleted",
        description: `${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} has been removed.`,
      });

      await loadMeals();
    } catch (error) {
      toast({
        title: "Unable to delete meal",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const totalAttendingToday = dbMeals.reduce(
    (sum, meal) => sum + (meal.attendingCount || 0),
    0,
  );
  const averageParticipation =
    dbTotalStudents > 0 && dbMeals.length > 0
      ? Math.round((totalAttendingToday / (dbTotalStudents * dbMeals.length)) * 100)
      : 0;

  return (
    <AuthGuard allowedRole="owner">
    <OwnerLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Meal Planning</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Plan meals and track student participation in real-time.
            </p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Meal
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: "Meals Today",
              value: dbMeals.length,
              icon: UtensilsCrossed,
              color: "teal",
            },
            {
              label: "Students",
              value: dbTotalStudents,
              icon: Users,
              color: "blue",
            },
            {
              label: "Attending Today",
              value: totalAttendingToday,
              icon: Check,
              color: "green",
            },
            {
              label: "Participation",
              value: `${averageParticipation}%`,
              icon: Calendar,
              color: "amber",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass border-white/5">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 text-${stat.color}-400`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-cyan-400" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="max-w-xs input-dark"
          />
        </div>

        <Tabs defaultValue="today" className="w-full">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="today" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              Today&apos;s Menu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mealTypes.map((type, index) => {
                const meal = getMealByType(type.id);
                const participating = meal?.attendingCount || 0;

                return (
                  <motion.div
                    key={type.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`glass overflow-hidden transition-all ${meal ? "border-cyan-500/30" : "border-dashed opacity-60"}`}>
                      <CardHeader className="pb-3 border-b border-white/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 text-cyan-400">
                              <type.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {type.label}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground font-medium">
                                {meal?.timing || type.time}
                              </p>
                            </div>
                          </div>
                          {meal && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => handleEdit(meal)} className="h-8 w-8 p-0 text-cyan-400"><Edit2 className="w-4 h-4" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => void handleDelete(meal)} className="h-8 w-8 p-0 text-red-400"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        {meal ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Menu Items</p>
                              <div className="flex flex-wrap gap-2">
                                {meal.menu.map((item, i) => (
                                  <Badge key={i} variant="outline" className="bg-white/5 border-white/10">{item}</Badge>
                                ))}
                              </div>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Attendance</p>
                                <span className="text-sm font-bold text-cyan-400">{participating} / {dbTotalStudents}</span>
                              </div>
                              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${dbTotalStudents > 0 ? (participating / dbTotalStudents) * 100 : 0}%` }}
                                  className="h-full bg-linear-to-r from-cyan-500 to-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="py-8 text-center">
                            <UtensilsCrossed className="w-10 h-10 mx-auto text-white/10 mb-2" />
                            <p className="text-muted-foreground text-sm">No meal planned yet</p>
                            <Button size="sm" variant="outline" onClick={() => { setMealType(type.id); setTiming(type.time); setIsDialogOpen(true); }} className="mt-3 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">Add Menu</Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="glass max-w-md border-white/10">
          <DialogHeader><DialogTitle className="gradient-text">{editingMeal ? "Edit Meal" : "Add New Meal"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2"><Label>Date</Label><Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input-dark" /></div>
            <div className="space-y-2"><Label>Meal Type</Label><Select value={mealType} onValueChange={(value) => setMealType(value as MealType)}><SelectTrigger className="input-dark"><SelectValue /></SelectTrigger><SelectContent>{mealTypes.map((type) => (<SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Timing</Label><Input value={timing} onChange={(e) => setTiming(e.target.value)} placeholder="7:00 AM - 9:00 AM" className="input-dark" /></div>
            <div className="space-y-2"><Label>Menu Items (comma-separated)</Label><Input value={menuItems} onChange={(e) => setMenuItems(e.target.value)} placeholder="Rice, Dal, Curry, Roti" className="input-dark" /></div>
            <div className="flex items-center space-x-2 pt-2"><input type="checkbox" id="notify" checked={shouldNotify} onChange={(e) => setShouldNotify(e.target.checked)} className="w-4 h-4 rounded border-white/10 bg-slate-800 text-cyan-500 focus:ring-cyan-500" /><Label htmlFor="notify" className="text-sm font-normal cursor-pointer text-slate-300">Notify all students about this update</Label></div>
            <div className="flex gap-3 pt-6"><Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }} className="flex-1 border-white/10">Cancel</Button><Button type="submit" className="flex-1 bg-linear-to-r from-cyan-500 to-blue-600">{editingMeal ? "Update" : "Add"} Meal</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </OwnerLayout>
    </AuthGuard>
  );
}
