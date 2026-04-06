import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminRestaurant from "@/pages/admin/Restaurant";
import AdminCategories from "@/pages/admin/Categories";
import AdminItems from "@/pages/admin/Items";
import AdminOffers from "@/pages/admin/Offers";
import AdminQR from "@/pages/admin/QR";
import AdminSetup from "@/pages/admin/Setup";
import CustomerMenu from "@/pages/menu/CustomerMenu";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Root → menu (QR scan / direct domain visit) */}
      <Route path="/">
        <Redirect to="/menu/1" />
      </Route>

      {/* Admin panel */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/restaurant" component={AdminRestaurant} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/items" component={AdminItems} />
      <Route path="/admin/offers" component={AdminOffers} />
      <Route path="/admin/qr" component={AdminQR} />
      <Route path="/admin/setup" component={AdminSetup} />

      {/* Customer menu */}
      <Route path="/menu/:restaurantId" component={CustomerMenu} />

      <Route component={NotFound} />
    </Switch>
  );
}


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;