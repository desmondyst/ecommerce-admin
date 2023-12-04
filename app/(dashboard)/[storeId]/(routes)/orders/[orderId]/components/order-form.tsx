"use client";

import * as z from "zod";
import { useState } from "react";
import {
    Category,
    Color,
    Image,
    Order,
    OrderItem,
    Product,
    Size,
} from "@prisma/client";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/modals/alert-modal";
import ImageUpload from "@/components/ui/image-upload";
import { revalidatePath } from "next/cache";
import clearCachesByServerAction from "../../components/reset-cache";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// #DBG: extra | over here after intiialData:
interface OrderFormProps {
    // there is a chance that product is not found
    initialData:
        | (Order & {
              // our initial data is not just product, but also the images FK
              orderItems: OrderItem[];
          })
        | null;
}

const formSchema = z.object({
    phone: z.string().min(1),
    address: z.string().min(1),
    isPaid: z.string().min(1),
});

type OrderFormValues = z.infer<typeof formSchema>;

const OrderForm: React.FC<OrderFormProps> = ({ initialData }) => {
    console.log(initialData);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = "Edit order";
    const description = "Edit an order";
    const toastMessage = "Order updated.";
    const action = "Save changes";

    // change isPaid from boolean to string
    const formattedData = {
        ...initialData,
        isPaid: initialData?.isPaid ? "Paid" : "Not Paid",
    };

    const form = useForm<OrderFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: formattedData || {
            phone: "",
            address: "",
            isPaid: "",
        },
    });

    const params = useParams();
    const router = useRouter();

    // can be called data or values doesnt matter
    // #DBG: Sometimes when you perform CRUD, u need refresh to get update because i think db not done then  upush therer alrdy
    // #NOTE: Changed to promise based toaster
    const onSubmit = async (data: OrderFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
                const updatePromise = toast.promise(
                    axios.patch(
                        `/api/${params.storeId}/orders/${params.orderId}`,
                        data
                    ),
                    {
                        loading: "Updating...",
                        success: toastMessage,
                        error: "Something went wrong.",
                    }
                );
                await updatePromise;
            }
            // # NOTE: NO creation of order feature for now
            // else {
            //     const createPromise = toast.promise(
            //         axios.post(`/api/${params.storeId}/products`, data),
            //         {
            //             loading: "Creating...",
            //             success: toastMessage,
            //             error: "Something went wrong.",
            //         }
            //     );
            //     await createPromise;
            // }
            clearCachesByServerAction(`/`);
            router.refresh();
            router.push(`/${params.storeId}/orders`);

            // toast.success(toastMessage);
        } catch (error: any) {
            console.log(error);
            // toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async () => {
        try {
            setLoading(true);
            const deletePromise = toast.promise(
                axios.delete(`/api/${params.storeId}/orders/${params.orderId}`),
                {
                    loading: "Deleting...",
                    success: "Product deleted.",
                    error: "Something went wrong.",
                }
            );
            await deletePromise;
            clearCachesByServerAction(`/`);
            router.refresh();
            router.push(`/${params.storeId}/orders`);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setOpen(false);
        }
    };

    return (
        <>
            <AlertModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={onDelete}
                loading={loading}
            />
            <div className="flex items-center justify-between">
                <Heading title={title} description={description} />
                {initialData && (
                    <Button
                        disabled={loading}
                        variant="destructive"
                        size="sm"
                        onClick={() => setOpen(true)}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <Separator />
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8 w-full"
                >
                    <div className="grid grid-cols-3 gap-8">
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={loading}
                                            placeholder="Phone"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={loading}
                                            placeholder="Blk 190 Jurong West #04-1770, 160190, SG"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isPaid"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Status</FormLabel>
                                    <Select
                                        disabled={loading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue
                                                    defaultValue={field.value}
                                                    placeholder="Payment Status"
                                                ></SelectValue>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {["Not Paid", "Paid"].map(
                                                (isPaid, index) => (
                                                    <SelectItem
                                                        key={index}
                                                        value={isPaid}
                                                    >
                                                        {isPaid}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button
                        disabled={loading}
                        className="ml-auto"
                        type="submit"
                    >
                        {action}
                    </Button>
                </form>
            </Form>
            <Separator />
        </>
    );
};

export default OrderForm;
