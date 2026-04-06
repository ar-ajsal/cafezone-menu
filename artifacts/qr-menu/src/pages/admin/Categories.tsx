import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { 
  useListCategories, 
  getListCategoriesQueryKey,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  Body,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableBody
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  name: z.string().min(1, "Name is required"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
});

export default function Categories() {
  const restaurantId = 1;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: categories, isLoading } = useListCategories(restaurantId, {
    query: {
      queryKey: getListCategoriesQueryKey(restaurantId),
      enabled: !!restaurantId,
    }
  });

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      sortOrder: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const data = {
      ...values,
      imageUrl: values.imageUrl || null,
    };

    if (editingId) {
      updateMutation.mutate({
        restaurantId,
        id: editingId,
        data,
      }, {
        onSuccess: () => {
          toast({ title: "Category updated" });
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey(restaurantId) });
          closeDialog();
        }
      });
    } else {
      createMutation.mutate({
        restaurantId,
        data,
      }, {
        onSuccess: () => {
          toast({ title: "Category created" });
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey(restaurantId) });
          closeDialog();
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate({ restaurantId, id }, {
        onSuccess: () => {
          toast({ title: "Category deleted" });
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey(restaurantId) });
        }
      });
    }
  };

  const openDialog = (category?: any) => {
    if (category) {
      setEditingId(category.id);
      form.reset({
        name: category.name,
        imageUrl: category.imageUrl || "",
        sortOrder: category.sortOrder,
      });
    } else {
      setEditingId(null);
      form.reset({
        name: "",
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

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground mt-1">Manage your menu categories.</p>
          </div>
          <Button onClick={() => openDialog()} data-testid="btn-add-category">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-24">Order</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-10 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : categories?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No categories found. Click "Add Category" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                categories?.sort((a, b) => a.sortOrder - b.sortOrder).map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {category.imageUrl ? (
                        <img src={category.imageUrl} alt={category.name} className="h-10 w-10 object-cover rounded-md" />
                      ) : (
                        <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.sortOrder}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openDialog(category)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(category.id)}>
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
              <DialogTitle>{editingId ? "Edit Category" : "Add Category"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>Category Image</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          folder="digital-menu/categories"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                    {editingId ? "Save Changes" : "Create"}
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