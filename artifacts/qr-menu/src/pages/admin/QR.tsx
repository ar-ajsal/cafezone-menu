import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetQrCode, getGetQrCodeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QRCodeSVG } from "qrcode.react";
import { Download } from "lucide-react";
import { useRef } from "react";

export default function QR() {
  const restaurantId = 1;
  const qrRef = useRef<SVGSVGElement>(null);

  const { data: qrData, isLoading } = useGetQrCode(restaurantId, {
    query: {
      queryKey: getGetQrCodeQueryKey(restaurantId),
      enabled: !!restaurantId,
    }
  });

  const downloadQR = () => {
    if (!qrRef.current) return;
    
    const svg = qrRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `menu-qr-${restaurantId}.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QR Code</h1>
          <p className="text-muted-foreground mt-1">
            Print this QR code and place it on tables for customers to scan.
          </p>
        </div>

        <div className="bg-card border rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
          {isLoading ? (
            <div className="space-y-6 flex flex-col items-center">
              <Skeleton className="w-64 h-64 rounded-xl" />
              <Skeleton className="h-10 w-40" />
            </div>
          ) : qrData ? (
            <div className="space-y-8 flex flex-col items-center">
              <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <QRCodeSVG
                  ref={qrRef}
                  value={qrData.url}
                  size={256}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "/favicon.svg",
                    x: undefined,
                    y: undefined,
                    height: 48,
                    width: 48,
                    excavate: true,
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-medium text-foreground">
                  Scan to view menu for {qrData.restaurantName}
                </p>
                <p className="text-sm text-muted-foreground break-all max-w-md">
                  {qrData.url}
                </p>
              </div>

              <Button onClick={downloadQR} size="lg" className="w-full max-w-xs gap-2 rounded-xl">
                <Download className="w-5 h-5" />
                Download QR Code
              </Button>
            </div>
          ) : (
            <div className="py-12 text-muted-foreground">
              Failed to load QR code.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}