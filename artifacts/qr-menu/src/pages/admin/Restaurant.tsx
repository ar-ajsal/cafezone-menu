import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { 
  useGetRestaurant, 
  getGetRestaurantQueryKey,
  useUpdateRestaurant 
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/ui/image-upload";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  logoUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
});

export default function AdminRestaurant() {
  const restaurantId = 1;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: restaurant, isLoading } = useGetRestaurant(restaurantId, {
    query: {
      queryKey: getGetRestaurantQueryKey(restaurantId),
      enabled: !!restaurantId,
    }
  });

  const updateMutation = useUpdateRestaurant();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      phone: "",
      address: "",
      logoUrl: "",
    },
  });

  useEffect(() => {
    if (restaurant) {
      form.reset({
        name: restaurant.name,
        slug: restaurant.slug,
        description: restaurant.description || "",
        phone: restaurant.phone || "",
        address: restaurant.address || "",
        logoUrl: restaurant.logoUrl || "",
      });
    }
  }, [restaurant, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateMutation.mutate({
      id: restaurantId,
      data: {
        ...values,
        description: values.description || null,
        phone: values.phone || null,
        address: values.address || null,
        logoUrl: values.logoUrl || null,
        primaryColor: restaurant?.primaryColor || null,
      }
    }, {
      onSuccess: (data) => {
        toast({
          title: "Success",
          description: "Restaurant profile updated successfully",
        });
        queryClient.setQueryData(getGetRestaurantQueryKey(restaurantId), data);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to update restaurant",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Restaurant Profile</h1>
          <p className="text-muted-foreground mt-2">
            Update your restaurant's public information.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restaurant Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Slug</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          value={field.value || ""} 
                          className="resize-none"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restaurant Logo</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            folder="digital-menu/logos"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
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

                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isPending}
                    data-testid="btn-save-restaurant"
                  >
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}