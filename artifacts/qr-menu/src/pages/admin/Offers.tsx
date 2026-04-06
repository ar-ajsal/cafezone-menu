import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { 
  useListOffers, 
  getListOffersQueryKey,
  useCreateOffer,
  useUpdateOffer,
  useDeleteOffer
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  discountPercent: z.coerce.number().min(0).max(100).optional().nullable(),
  validUntil: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")).nullable(),
});

export default function Offers() {
  const restaurantId = 1;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: offers, isLoading } = useListOffers(restaurantId, {
    query: {
      queryKey: getListOffersQueryKey(restaurantId),
      enabled: !!restaurantId,
    }
  });

  const createMutation = useCreateOffer();
  const updateMutation = useUpdateOffer();
  const deleteMutation = useDeleteOffer();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      discountPercent: null,
      validUntil: "",
      isActive: true,
      imageUrl: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const data = {
      ...values,
      description: values.description || null,
      imageUrl: values.imageUrl || null,
      validUntil: values.validUntil || null,
      discountPercent: values.discountPercent || null,
    };

    if (editingId) {
      updateMutation.mutate({
        restaurantId,
        id: editingId,
        data,
      }, {
        onSuccess: () => {
          toast({ title: "Offer updated" });
          queryClient.invalidateQueries({ queryKey: getListOffersQueryKey(restaurantId) });
          closeDialog();
        }
      });
    } else {
      createMutation.mutate({
        restaurantId,
        data,
      }, {
        onSuccess: () => {
          toast({ title: "Offer created" });
          queryClient.invalidateQueries({ queryKey: getListOffersQueryKey(restaurantId) });
          closeDialog();
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this offer?")) {
      deleteMutation.mutate({ restaurantId, id }, {
        onSuccess: () => {
          toast({ title: "Offer deleted" });
          queryClient.invalidateQueries({ queryKey: getListOffersQueryKey(restaurantId) });
        }
      });
    }
  };

  const openDialog = (offer?: any) => {
    if (offer) {
      setEditingId(offer.id);
      form.reset({
        title: offer.title,
        description: offer.description || "",
        discountPercent: offer.discountPercent,
        validUntil: offer.validUntil ? offer.validUntil.split('T')[0] : "", // Simple date string conversion
        isActive: offer.isActive,
        imageUrl: offer.imageUrl || "",
      });
    } else {
      setEditingId(null);
      form.reset({
        title: "",
        description: "",
        discountPercent: null,
        validUntil: "",
        isActive: true,
        imageUrl: "",
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    form.reset();
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Special Offers</h1>
            <p className="text-muted-foreground mt-1">Manage promotions and banners.</p>
          </div>
          <Button onClick={() => openDialog()} data-testid="btn-add-offer">
            <Plus className="w-4 h-4 mr-2" />
            Add Offer
          </Button>
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-16 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : offers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No offers found. Click "Add Offer" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                offers?.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      {offer.imageUrl ? (
                        <img src={offer.imageUrl} alt={offer.title} className="h-10 w-16 object-cover rounded-md" />
                      ) : (
                        <div className="h-10 w-16 bg-muted rounded-md flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{offer.title}</TableCell>
                    <TableCell>
                      {offer.discountPercent ? `${offer.discountPercent}% OFF` : '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full ${offer.isActive ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                        {offer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openDialog(offer)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(offer.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Offer" : "Add Offer"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          value={field.value || ""} 
                          className="resize-none"
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="discountPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount % (Optional)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="validUntil"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valid Until (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banner Image</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          folder="digital-menu/offers"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg p-4 border">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end pt-4 gap-2">
                  <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingId ? "Save Changes" : "Create Offer"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}