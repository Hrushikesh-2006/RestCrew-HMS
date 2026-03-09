"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  Plus,
  Clock,
  Users,
  Check,
  X,
  Calendar,
  Coffee,
  Sun,
  Moon,
  Edit2,
  Trash2,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useDataStore, Meal } from "@/lib/data-store";
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

const mealTypes = [
  {
    id: "breakfast",
    label: "Breakfast",
    icon: Coffee,
    time: "7:00 AM - 9:00 AM",
  },
  { id: "lunch", label: "Lunch", icon: Sun, time: "12:00 PM - 2:00 PM" },
  { id: "dinner", label: "Dinner", icon: Moon, time: "7:00 PM - 9:00 PM" },
];

export default function OwnerMealsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { owner, isAuthenticated, userType } = useAuthStore();
  const {
    meals,
    mealParticipations,
    students,
    addMeal,
    updateMeal,
    deleteMeal,
  } = useDataStore();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA"),
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  // Form state
  const [mealType, setMealType] = useState("breakfast");
  const [menuItems, setMenuItems] = useState("");
  const [timing, setTiming] = useState("7:00 AM - 9:00 AM");

  useEffect(() => {
    if (!isAuthenticated || userType !== "owner") {
      router.push("/owner/login");
    }
  }, [isAuthenticated, userType, router]);

  if (!owner) return null;

  const getMealsForDate = (date: string) => {
    return meals.filter((m) => m.date === date);
  };

  const getParticipationCount = (mealId: string) => {
    return mealParticipations.filter(
      (mp) => mp.mealId === mealId && mp.willAttend,
    ).length;
  };

  const getDeclineCount = (mealId: string) => {
    return mealParticipations.filter(
      (mp) => mp.mealId === mealId && !mp.willAttend,
    ).length;
  };

  const getMealByType = (date: string, type: string) => {
    return meals.find((m) => m.date === date && m.type === type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const menu = menuItems
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const mealData = {
      date: selectedDate,
      type: mealType as "breakfast" | "lunch" | "dinner",
      menu,
      timing,
      ownerEmail: owner.email,
    };

    if (editingMeal) {
      updateMeal(editingMeal.id, mealData);
      toast({
        title: "Meal Updated",
        description: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} has been updated.`,
      });
    } else {
      // Check if meal already exists for this date and type
      const existing = getMealByType(selectedDate, mealType);
      if (existing) {
        toast({
          title: "Error",
          description: `A ${mealType} meal already exists for this date.`,
          variant: "destructive",
        });
        return;
      }

      addMeal({
        id: `meal_${Date.now()}`,
        ...mealData,
      });
      toast({
        title: "Meal Added",
        description: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} has been added.`,
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setMealType(meal.type);
    setMenuItems(meal.menu.join(", "));
    setTiming(meal.timing);
    setIsDialogOpen(true);
  };

  const handleDelete = (meal: Meal) => {
    deleteMeal(meal.id);
    toast({
      title: "Meal Deleted",
      description: `${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} has been removed.`,
    });
  };

  const resetForm = () => {
    setEditingMeal(null);
    setMealType("breakfast");
    setMenuItems("");
    setTiming("7:00 AM - 9:00 AM");
  };

  const getWeekDates = () => {
    const dates: string[] = [];
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  return (
    <OwnerLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Meal Planning</h1>
            <p className="text-muted-foreground mt-1">
              Plan meals and track student participation
            </p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Meal
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: "Today's Meals",
              value: getMealsForDate(new Date().toISOString().split("T")[0])
                .length,
              icon: UtensilsCrossed,
              color: "teal",
            },
            {
              label: "Total Students",
              value: students.length,
              icon: Users,
              color: "blue",
            },
            {
              label: "Expected Today",
              value: students.length * 3,
              icon: Calendar,
              color: "amber",
            },
            {
              label: "Avg Participation",
              value: "85%",
              icon: Check,
              color: "green",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass">
                <CardContent className="p-4 flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      stat.color === "teal"
                        ? "bg-teal-500/20 text-teal-400"
                        : stat.color === "blue"
                          ? "bg-blue-500/20 text-blue-400"
                          : stat.color === "amber"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-teal-400" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="max-w-xs input-dark"
          />
        </div>

        {/* Today's Meals */}
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="bg-slate-800/50">
            <TabsTrigger
              value="today"
              className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400"
            >
              Today's Menu
            </TabsTrigger>
            <TabsTrigger
              value="weekly"
              className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400"
            >
              Weekly Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mealTypes.map((type, index) => {
                const meal = getMealByType(selectedDate, type.id);
                const participating = meal ? getParticipationCount(meal.id) : 0;
                const declining = meal ? getDeclineCount(meal.id) : 0;

                return (
                  <motion.div
                    key={type.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`glass ${meal ? "border-teal-500/30" : "border-dashed"} hover:shadow-lg transition-all`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                type.id === "breakfast"
                                  ? "bg-amber-500/20 text-amber-400"
                                  : type.id === "lunch"
                                    ? "bg-teal-500/20 text-teal-400"
                                    : "bg-purple-500/20 text-purple-400"
                              }`}
                            >
                              <type.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {type.label}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground">
                                {meal?.timing || type.time}
                              </p>
                            </div>
                          </div>
                          {meal && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(meal)}
                                className="h-8 w-8 p-0 text-teal-400"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(meal)}
                                className="h-8 w-8 p-0 text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {meal ? (
                          <>
                            <div className="space-y-2 mb-4">
                              <p className="text-sm font-medium text-muted-foreground">
                                Menu:
                              </p>
                              <ul className="space-y-1">
                                {meal.menu.map((item, i) => (
                                  <li
                                    key={i}
                                    className="text-sm flex items-center gap-2"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="pt-4 border-t border-border/30">
                              <p className="text-xs text-muted-foreground mb-2">
                                Participation
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className="border-green-500/30 text-green-400 bg-green-500/10"
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    {participating} Attending
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="border-red-500/30 text-red-400 bg-red-500/10"
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    {declining} Not Attending
                                  </Badge>
                                </div>
                              </div>
                              <div className="mt-3 h-2 rounded-full bg-slate-700 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all"
                                  style={{
                                    width: `${students.length > 0 ? (participating / students.length) * 100 : 0}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="py-8 text-center">
                            <UtensilsCrossed className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
                            <p className="text-muted-foreground text-sm">
                              No meal planned
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setMealType(type.id);
                                setTiming(type.time);
                                setIsDialogOpen(true);
                              }}
                              className="mt-3 border-teal-500/30 text-teal-400"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Menu
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="mt-6">
            <Card className="glass overflow-x-auto">
              <CardContent className="p-0">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="p-4 text-left text-muted-foreground font-medium">
                        Day
                      </th>
                      {mealTypes.map((type) => (
                        <th
                          key={type.id}
                          className="p-4 text-center text-muted-foreground font-medium"
                        >
                          {type.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weekDates.map((date, index) => {
                      const dayName = new Date(date).toLocaleDateString(
                        "en-US",
                        { weekday: "short" },
                      );
                      const isToday =
                        date === new Date().toISOString().split("T")[0];

                      return (
                        <motion.tr
                          key={date}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className={`border-b border-border/20 ${isToday ? "bg-teal-500/5" : ""}`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-medium ${isToday ? "text-teal-400" : ""}`}
                              >
                                {dayName}
                              </span>
                              {isToday && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-teal-500/30 text-teal-400"
                                >
                                  Today
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </td>
                          {mealTypes.map((type) => {
                            const meal = getMealByType(date, type.id);
                            const count = meal
                              ? getParticipationCount(meal.id)
                              : 0;

                            return (
                              <td key={type.id} className="p-4 text-center">
                                {meal ? (
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                      {count} attending
                                    </p>
                                    <div className="w-full h-1.5 rounded-full bg-slate-700 mx-auto max-w-[60px]">
                                      <div
                                        className="h-full bg-teal-500 rounded-full"
                                        style={{
                                          width: `${students.length > 0 ? (count / students.length) * 100 : 0}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">
                                    -
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="glass max-w-md">
          <DialogHeader>
            <DialogTitle className="gradient-text">
              {editingMeal ? "Edit Meal" : "Add New Meal"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-dark"
              />
            </div>

            <div className="space-y-2">
              <Label>Meal Type</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger className="input-dark">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mealTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Timing</Label>
              <Input
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                placeholder="7:00 AM - 9:00 AM"
                className="input-dark"
              />
            </div>

            <div className="space-y-2">
              <Label>Menu Items (comma-separated)</Label>
              <Input
                value={menuItems}
                onChange={(e) => setMenuItems(e.target.value)}
                placeholder="Rice, Dal, Curry, Roti"
                className="input-dark"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600"
              >
                {editingMeal ? "Update" : "Add"} Meal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </OwnerLayout>
  );
}
