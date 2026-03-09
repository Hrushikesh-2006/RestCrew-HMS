"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  Calendar,
  Clock,
  Check,
  X,
  Coffee,
  Sun,
  Moon,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useDataStore } from "@/lib/data-store";
import { StudentLayout } from "@/components/student/student-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function StudentMealsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { student, isAuthenticated, userType } = useAuthStore();
  const { meals, mealParticipations, setMealParticipation } = useDataStore();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA"),
  );

  useEffect(() => {
    if (!isAuthenticated || userType !== "student") {
      router.push("/student/login");
    }
  }, [isAuthenticated, userType, router]);

  if (!student) return null;

  const getMealByType = (date: string, type: string) => {
    return meals.find((m) => m.date === date && m.type === type);
  };

  const getParticipation = (mealId: string) => {
    return mealParticipations.find(
      (mp) => mp.studentId === student.id && mp.mealId === mealId,
    );
  };

  const handleParticipation = (mealId: string, willAttend: boolean) => {
    setMealParticipation({
      id: `mp_${Date.now()}`,
      studentId: student.id,
      mealId,
      willAttend,
    });

    toast({
      title: willAttend ? "Attendance Confirmed" : "Attendance Cancelled",
      description: willAttend
        ? "You'll be counted for this meal"
        : "You've opted out of this meal",
    });
  };

  const getWeekDates = () => {
    const dates: string[] = [];
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const isPastDate = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    return checkDate < today;
  };

  return (
    <StudentLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text-reverse">
              Meal Planning
            </h1>
            <p className="text-muted-foreground mt-1">
              View the menu and select your meal participation
            </p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-amber-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-dark px-4 py-2 rounded-lg bg-slate-800/50 border border-border/30"
          />
        </div>

        {/* Today's Meals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mealTypes.map((type, index) => {
            const meal = getMealByType(selectedDate, type.id);
            const participation = meal ? getParticipation(meal.id) : null;
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
                    participation?.willAttend
                      ? "border-green-500/30"
                      : participation && !participation.willAttend
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
                            Today's Menu:
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
                                onClick={() =>
                                  handleParticipation(meal.id, true)
                                }
                                className={`flex-1 ${
                                  participation?.willAttend
                                    ? "bg-green-500 hover:bg-green-600"
                                    : "bg-slate-700 hover:bg-slate-600"
                                }`}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Yes
                              </Button>
                              <Button
                                onClick={() =>
                                  handleParticipation(meal.id, false)
                                }
                                variant={
                                  participation && !participation.willAttend
                                    ? "default"
                                    : "outline"
                                }
                                className={`flex-1 ${
                                  participation && !participation.willAttend
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
                                participation?.willAttend
                                  ? "border-green-500/30 text-green-400"
                                  : "border-red-500/30 text-red-400"
                              }
                            >
                              {participation?.willAttend
                                ? "You attended"
                                : "You did not attend"}
                            </Badge>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="py-8 text-center">
                        <UtensilsCrossed className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-muted-foreground">
                          No menu available
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Check back later
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Weekly Overview */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              Weekly Participation
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
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
                  const dayName = new Date(date).toLocaleDateString("en-US", {
                    weekday: "short",
                  });
                  const isToday =
                    date === new Date().toISOString().split("T")[0];
                  const isPast = isPastDate(date);

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
                          {new Date(date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </td>
                      {mealTypes.map((type) => {
                        const meal = getMealByType(date, type.id);
                        const participation = meal
                          ? getParticipation(meal.id)
                          : null;

                        return (
                          <td key={type.id} className="p-3 text-center">
                            {meal && participation ? (
                              <div
                                className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${
                                  participation.willAttend
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {participation.willAttend ? (
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
      </motion.div>
    </StudentLayout>
  );
}
