"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  Calendar,
  Check,
  X,
  Coffee,
  Sun,
  Moon,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { requestJson } from "@/lib/api-client";
import { StudentLayout } from "@/components/student/student-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMealLiveUpdates } from "@/hooks/use-meal-live-updates";

type MealType = "breakfast" | "lunch" | "dinner";

type StudentMeal = {
  id: string;
  date: string;
  type: MealType;
  menu: string[];
  timing: string;
  rsvp: boolean | null;
};

type StudentMealsResponse = {
  meals: StudentMeal[];
};

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

const formatLocalDate = (date: Date) => date.toLocaleDateString("en-CA");
const parseLocalDate = (value: string) => new Date(`${value}T00:00:00`);

export default function StudentMealsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { student, isAuthenticated, userType } = useAuthStore();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA"),
  );
  const [weeklyMeals, setWeeklyMeals] = useState<StudentMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMeals = async (showLoader = false) => {
    if (!student?.id) {
      return;
    }

    try {
      if (showLoader) {
        setIsLoading(true);
      }

      const data = await requestJson<StudentMealsResponse>(
        `/api/students/${student.id}/meals?date=${selectedDate}`,
      );
      setWeeklyMeals(data.meals ?? []);
    } catch (error) {
      console.error("Failed to load meals", error);
      toast({
        title: "Unable to load meals",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useMealLiveUpdates({
    ownerId: student?.ownerId,
    onMealUpdate: loadMeals,
    enabled: Boolean(student?.ownerId),
  });

  useEffect(() => {
    if (!isAuthenticated || userType !== "student") {
      router.push("/student/login");
    }
  }, [isAuthenticated, userType, router]);

  useEffect(() => {
    void loadMeals(true);
  }, [student?.id, selectedDate]);

  if (!student) return null;

  const getMealByType = (date: string, type: MealType) => {
    return weeklyMeals.find((meal) => meal.date === date && meal.type === type);
  };

  const handleParticipation = async (mealId: string, willAttend: boolean) => {
    try {
      await requestJson("/api/meals/rsvp", {
        method: "POST",
        body: JSON.stringify({
          mealId,
          studentId: student.id,
          willAttend,
        }),
      });

      setWeeklyMeals((currentMeals) =>
        currentMeals.map((meal) =>
          meal.id === mealId ? { ...meal, rsvp: willAttend } : meal,
        ),
      );

      toast({
        title: willAttend ? "Attendance Confirmed" : "Attendance Cancelled",
        description: willAttend
          ? "You'll be counted for this meal"
          : "You've opted out of this meal",
      });
    } catch (error) {
      toast({
        title: "Unable to update RSVP",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const getWeekDates = () => {
    const dates: string[] = [];
    const start = parseLocalDate(selectedDate);
    start.setDate(start.getDate() - start.getDay());

    for (let i = 0; i < 7; i += 1) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      dates.push(formatLocalDate(date));
    }

    return dates;
  };

  const weekDates = getWeekDates();

  const isPastDate = (date: string) => {
    const today = parseLocalDate(formatLocalDate(new Date()));
    const checkDate = parseLocalDate(date);
    return checkDate < today;
  };

  const todayDate = formatLocalDate(new Date());

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text-reverse">
              Meal Planning
            </h1>
            <p className="text-muted-foreground mt-1">
              View the menu and select your meal participation. Owner updates sync automatically.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-amber-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-dark px-4 py-2 rounded-lg bg-slate-800/50 border border-border/30"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mealTypes.map((type, index) => {
            const meal = getMealByType(selectedDate, type.id);
            const isPast = isPastDate(selectedDate);

            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`glass h-full ${
                    meal?.rsvp === true
                      ? "border-green-500/30"
                      : meal?.rsvp === false
                        ? "border-red-500/30"
                        : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          type.id === "breakfast"
                            ? "bg-amber-500/20 text-amber-400"
                            : type.id === "lunch"
                              ? "bg-teal-500/20 text-teal-400"
                              : "bg-purple-500/20 text-purple-400"
                        }`}
                      >
                        <type.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{type.label}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {meal?.timing || type.time}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {meal ? (
                      <>
                        <div className="mb-4">
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            Today&apos;s Menu:
                          </p>
                          <ul className="space-y-1">
                            {meal.menu.map((item, i) => (
                              <li
                                key={i}
                                className="text-sm flex items-center gap-2"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {!isPast ? (
                          <div className="pt-4 border-t border-border/30">
                            <p className="text-xs text-muted-foreground mb-3">
                              Will you attend this meal?
                            </p>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => void handleParticipation(meal.id, true)}
                                className={`flex-1 ${
                                  meal.rsvp === true
                                    ? "bg-green-500 hover:bg-green-600"
                                    : "bg-slate-700 hover:bg-slate-600"
                                }`}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Yes
                              </Button>
                              <Button
                                onClick={() => void handleParticipation(meal.id, false)}
                                variant={meal.rsvp === false ? "default" : "outline"}
                                className={`flex-1 ${
                                  meal.rsvp === false
                                    ? "bg-red-500 hover:bg-red-600 border-red-500"
                                    : "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                }`}
                              >
                                <X className="w-4 h-4 mr-1" />
                                No
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="pt-4 border-t border-border/30">
                            <Badge
                              variant="outline"
                              className={
                                meal.rsvp
                                  ? "border-green-500/30 text-green-400"
                                  : "border-red-500/30 text-red-400"
                              }
                            >
                              {meal.rsvp ? "You attended" : "You did not attend"}
                            </Badge>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="py-8 text-center">
                        <UtensilsCrossed className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                        {isLoading ? (
                          <p className="text-muted-foreground">Loading menu...</p>
                        ) : (
                          <>
                            <p className="text-muted-foreground">
                              No menu available
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Check back later
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              Weekly Participation
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-150">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left p-3 text-muted-foreground font-medium">
                    Day
                  </th>
                  {mealTypes.map((type) => (
                    <th
                      key={type.id}
                      className="text-center p-3 text-muted-foreground font-medium"
                    >
                      {type.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weekDates.map((date, index) => {
                  const dayName = parseLocalDate(date).toLocaleDateString("en-US", {
                    weekday: "short",
                  });
                  const isToday = date === todayDate;

                  return (
                    <motion.tr
                      key={date}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-b border-border/20 ${isToday ? "bg-amber-500/5" : ""}`}
                    >
                      <td className="p-3">
                        <div>
                          <span
                            className={`font-medium ${isToday ? "text-amber-400" : ""}`}
                          >
                            {dayName}
                          </span>
                          {isToday && (
                            <Badge
                              variant="outline"
                              className="ml-2 text-xs border-amber-500/30 text-amber-400"
                            >
                              Today
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {parseLocalDate(date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </td>
                      {mealTypes.map((type) => {
                        const meal = getMealByType(date, type.id);

                        return (
                          <td key={type.id} className="p-3 text-center">
                            {meal && meal.rsvp !== null ? (
                              <div
                                className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${
                                  meal.rsvp
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {meal.rsvp ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <X className="w-4 h-4" />
                                )}
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
      </div>
    </StudentLayout>
  );
}
