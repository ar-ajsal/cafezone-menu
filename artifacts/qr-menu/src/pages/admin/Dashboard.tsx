import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetRestaurantStats, getGetRestaurantStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  UtensilsCrossed, 
  List, 
  Tags, 
  Leaf, 
  Drumstick, 
  Coffee, 
  PackagePlus 
} from "lucide-react";

export default function Dashboard() {
  const restaurantId = 1; // Default seeded restaurant
  const { data: stats, isLoading } = useGetRestaurantStats(restaurantId, {
    query: {
      queryKey: getGetRestaurantStatsQueryKey(restaurantId),
      enabled: !!restaurantId,
    }
  });

  const statCards = [
    { title: "Total Items", value: stats?.totalItems, icon: UtensilsCrossed, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Categories", value: stats?.totalCategories, icon: List, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Active Offers", value: stats?.totalOffers, icon: Tags, color: "text-orange-500", bg: "bg-orange-500/10" },
    { title: "Veg Items", value: stats?.vegCount, icon: Leaf, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Non-Veg Items", value: stats?.nonVegCount, icon: Drumstick, color: "text-red-500", bg: "bg-red-500/10" },
    { title: "Beverages", value: stats?.beverageCount, icon: Coffee, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { title: "Combos", value: stats?.comboCount, icon: PackagePlus, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of your restaurant menu and catalog.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-none shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-3xl font-bold">{stat.value || 0}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}