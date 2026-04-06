import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { 
  useListItems, 
  getListItemsQueryKey,
  useListCategories,
  useCreateItem,
  useUpdateItem,
  useDeleteItem
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Pencil, Trash2, Image as ImageIcon, Search } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "Price must be >= 0"),
  categoryId: z.coerce.number().nullable().optional(),
  type: z.enum(["veg", "non-veg", "beverage"]),
  isCombo: z.boolean().default(false),
  comboItemCount: z.coerce.number().optional().nullable(),
  isSpicy: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")).nullable(),
  sortOrder: z.coerce.number().int().default(0),
});

export default function Items() {
  const restaurantId = 1;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const { data: items, isLoading: itemsLoading } = useListItems(
    restaurantId, 
    { search: search || undefined },
    {
      query: {
        queryKey: getListItemsQueryKey(restaurantId, { search: search || undefined }),
        enabled: !!restaurantId,
      }
    }
  );

  const { data: categories } = useListCategories(restaurantId, {
    query: {
      queryKey: ["categories", restaurantId],
      enabled: !!restaurantId,
    }
  });

  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();
  const deleteMutation = useDeleteItem();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      categoryId: null,
      type: "veg",
      isCombo: false,
      comboItemCount: null,
      isSpicy: false,
      isAvailable: true,
      imageUrl: "",
      sortOrder: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const data = {
      ...values,
      categoryId: values.categoryId || null,
      imageUrl: values.imageUrl || null,
      description: values.description || null,
      comboItemCount: values.isCombo ? values.comboItemCount : null,
    };

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data,
      }, {
        onSuccess: () => {
          toast({ title: "Item updated" });
          queryClient.invalidateQueries({ queryKey: getListItemsQueryKey(restaurantId, { search: search || undefined }) });
          closeDialog();
        },
        onError: (err: any) => {
          toast({ title: "Error updating item", description: err.message || "Unknown error", variant: "destructive" });
        }
      });
    } else {
      createMutation.mutate({
        restaurantId,
        data,
      }, {
        onSuccess: () => {
          toast({ title: "Item created" });
          queryClient.invalidateQueries({ queryKey: getListItemsQueryKey(restaurantId, { search: search || undefined }) });
          closeDialog();
        },
        onError: (err: any) => {
          toast({ title: "Error creating item", description: err.message || "Unknown error", variant: "destructive" });
        }
      });
    }
  };

  const onFormError = (errors: any) => {
    console.error("Form validation errors:", errors);
    toast({ 
      title: "Validation Error", 
      description: "Please check the form for missing or invalid fields.", 
      variant: "destructive" 
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Item deleted" });
          queryClient.invalidateQueries({ queryKey: getListItemsQueryKey(restaurantId, { search: search || undefined }) });
        }
      });
    }
  };

  const openDialog = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      form.reset({
        name: item.name,
        description: item.description || "",
        price: item.price,
        categoryId: item.categoryId || null,
        type: item.type,
        isCombo: item.isCombo,
        comboItemCount: item.comboItemCount,
        isSpicy: item.isSpicy,
        isAvailable: item.isAvailable,
        imageUrl: item.imageUrl || "",
        sortOrder: item.sortOrder,
      });
    } else {
      setEditingId(null);
      form.reset({
        name: "",
        description: "",
        price: 0,
        categoryId: categories?.[0]?.id || null,
        type: "veg",
        isCombo: false,
        comboItemCount: null,
        isSpicy: false,
        isAvailable: true,
        imageUrl: "",
        sortOrder: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    form.reset();
  };

  const isComboValue = form.watch("isCombo");

  return (
    <AdminLayout>
      <div className="space-y-6 mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Menu Items</h1>
            <p className="text-muted-foreground mt-1">Manage dishes and beverages.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search items..." 
                className="pl-9 w-[250px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={() => openDialog()} data-testid="btn-add-item">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-10 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : items?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No menu items found. Click "Add Item" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="h-10 w-10 object-cover rounded-md" />
                      ) : (
                        <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {item.name}
                        {item.isCombo && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500 text-amber-600 bg-amber-50">
                            COMBO
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.categoryName || "Uncategorized"}</TableCell>
                    <TableCell>₹{item.price}</TableCell>
                    <TableCell>
                      <span className="capitalize text-xs px-2 py-1 bg-muted rounded-full">
                        {item.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openDialog(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item.id)}>
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Item" : "Add Menu Item"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={(val) => field.onChange(val ? Number(val) : null)} 
                          value={field.value ? String(field.value) : undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((cat) => (
                              <SelectItem key={cat.id} value={String(cat.id)}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="veg">Vegetarian</SelectItem>
                            <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                            <SelectItem value="beverage">Beverage</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
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

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Image</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          folder="digital-menu/items"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-muted/20">
                  <FormField
                    control={form.control}
                    name="isAvailable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg p-3 border bg-card">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Available</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isSpicy"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg p-3 border bg-card">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Spicy</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border p-4 rounded-lg bg-muted/20 space-y-4">
                  <FormField
                    control={form.control}
                    name="isCombo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>This is a Combo Item</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {isComboValue && (
                    <FormField
                      control={form.control}
                      name="comboItemCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of items in combo</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end pt-4 gap-2">
                  <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingId ? "Save Changes" : "Create Item"}
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