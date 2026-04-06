import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { CheckCircle2, AlertCircle, Loader2, Database, CloudUpload } from "lucide-react";

interface SetupStatus {
  isSetup: boolean;
  restaurant: {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    logoUrl?: string | null;
    phone?: string | null;
    address?: string | null;
  } | null;
}

export default function Setup() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "Snacky Cafe Kakkanchery",
    slug: "snacky-cafe-kakkanchery",
    description: "Delicious snacks and beverages",
    phone: "",
    address: "Kakkanchery, Kerala",
    logoUrl: "",
  });

  useEffect(() => {
    fetch("/api/setup/status")
      .then(r => r.json())
      .then(setStatus)
      .catch(() => setError("Cannot reach API server. Make sure it's running on port 5000."))
      .finally(() => setLoading(false));
  }, []);

  const handleSetup = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Setup failed");
      setResult(data.message);
      setStatus({ isSetup: true, restaurant: data.restaurant });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Setup & Status</h1>
          <p className="text-muted-foreground mt-2">
            Initialize your restaurant in MongoDB and verify the connection.
          </p>
        </div>

        {/* Status Card */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold text-lg">Database Status</h2>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking MongoDB connection…
            </div>
          ) : error && !status ? (
            <div className="flex items-start gap-2 text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Cannot connect to API server</p>
                <p className="text-sm mt-1">{error}</p>
                <p className="text-sm mt-2 text-muted-foreground">
                  Run: <code className="bg-muted px-1 rounded text-xs">npm run start</code> inside <code className="bg-muted px-1 rounded text-xs">artifacts/api-server</code>
                </p>
              </div>
            </div>
          ) : status?.isSetup ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">MongoDB connected · Restaurant created (id=1)</span>
              </div>
              <div className="bg-muted/40 rounded-lg p-4 text-sm space-y-1">
                <p><span className="text-muted-foreground">Name:</span> {status.restaurant?.name}</p>
                <p><span className="text-muted-foreground">Slug:</span> {status.restaurant?.slug}</p>
                {status.restaurant?.phone && <p><span className="text-muted-foreground">Phone:</span> {status.restaurant.phone}</p>}
                {status.restaurant?.address && <p><span className="text-muted-foreground">Address:</span> {status.restaurant.address}</p>}
              </div>
              <p className="text-sm text-muted-foreground">
                ✅ You're all set! Head to <strong>Restaurant</strong> to update the logo, or <strong>Categories</strong> to add menu categories.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>API server connected but no restaurant found. Fill out the form below and click <strong>Initialize</strong>.</span>
            </div>
          )}
        </div>

        {/* Setup Form — only show when not yet set up */}
        {!loading && status && !status.isSetup && (
          <div className="rounded-xl border bg-card p-6 space-y-5">
            <div className="flex items-center gap-3">
              <CloudUpload className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold text-lg">Initialize Restaurant</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Restaurant Name *</label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">URL Slug *</label>
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Phone</label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Address</label>
                <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Restaurant Logo</label>
              <ImageUpload
                value={form.logoUrl}
                onChange={url => setForm(f => ({ ...f, logoUrl: url }))}
                folder="digital-menu/logos"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {result && (
              <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {result}
              </div>
            )}

            <Button
              onClick={handleSetup}
              disabled={submitting || !form.name || !form.slug}
              className="w-full"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Initializing…</>
              ) : (
                "🚀 Initialize Restaurant in MongoDB"
              )}
            </Button>
          </div>
        )}

        {/* Cloudinary Info */}
        <div className="rounded-xl border bg-card p-6 space-y-3">
          <h2 className="font-semibold text-lg">Cloudinary Config</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-muted-foreground text-xs">Cloud Name</p>
              <p className="font-mono font-medium">dq7vas0ll</p>
            </div>
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-muted-foreground text-xs">Upload Folder</p>
              <p className="font-mono font-medium">digital-menu/</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Images uploaded from admin pages are stored in your Cloudinary account under the <code className="bg-muted px-1 rounded">digital-menu/</code> folder.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
