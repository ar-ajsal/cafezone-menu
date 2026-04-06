import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, QrCode } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <UtensilsCrossed className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">QR Digital Menu</h1>
          <p className="text-lg text-muted-foreground">
            A beautiful, mobile-first dining experience.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/menu/1" className="flex-1">
            <Button size="lg" className="w-full text-lg h-14 rounded-xl gap-2 shadow-lg">
              <QrCode className="w-5 h-5" />
              View Menu
            </Button>
          </Link>
          <Link href="/admin" className="flex-1">
            <Button size="lg" variant="outline" className="w-full text-lg h-14 rounded-xl border-2">
              Admin Panel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}