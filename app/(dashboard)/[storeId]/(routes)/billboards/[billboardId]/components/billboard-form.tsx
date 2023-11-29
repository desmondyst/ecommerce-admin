"use client";

import * as z from "zod";
import { useState } from "react";
import { Billboard } from "@prisma/client";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import {
    Form,
    FormControl,
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

interface BillboardFormProps {
    // there is a chance that billboard is not found
    initialData: Billboard | null;
}

const formSchema = z.object({
    label: z.string().min(1),
    imageUrl: z.string().min(1),
});

type BillboardFormValues = z.infer<typeof formSchema>;

const BillboardForm: React.FC<BillboardFormProps> = ({ initialData }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? "Edit billboard" : "Create billboard";
    const description = initialData
        ? "Edit a billboards"
        : "Add a new billboard";
    const toastMessage = initialData
        ? "Billboard updated."
        : "Billboard created.";
    const action = initialData ? "Save changes" : "Create";

    const form = useForm<BillboardFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            label: "",
            imageUrl: "",
        },
    });

    const params = useParams();
    const router = useRouter();

    // can be called data or values doesnt matter
    // #DBG: Sometimes when you perform CRUD, u need refresh to get update because i think db not done then  upush therer alrdy
    // #NOTE: Changed to promise based toaster
    const onSubmit = async (data: BillboardFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
                const updatePromise = toast.promise(
                    axios.patch(
                        `/api/${params.storeId}/billboards/${params.billboardId}`,
                        data
                    ),
                    {
                        loading: "Updating...",
                        success: toastMessage,
                        error: "Something went wrong.",
                    }
                );
                await updatePromise;
            } else {
                const createPromise = toast.promise(
                    axios.post(`/api/${params.storeId}/billboards`, data),
                    {
                        loading: "Creating...",
                        success: toastMessage,
                        error: "Something went wrong.",
                    }
                );
                await createPromise;
            }
            clearCachesByServerAction(`/`);
            router.refresh();
            router.push(`/${params.storeId}/billboards`);

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
                axios.delete(
                    `/api/${params.storeId}/billboards/${params.billboardId}`
                ),
                {
                    loading: "Deleting...",
                    success: "Billboard deleted",
                    error: "Make sure you removed all categories using this billboard first",
                }
            );
            await deletePromise;
            clearCachesByServerAction(`/`);
            router.refresh();
            router.push(`/${params.storeId}/billboards`);
            // toast.success("Billboard deleted");
        } catch (error) {
            console.log(error);
            // toast.error(
            // "Make sure you removed all categories using this billboard first"
            // );
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
                    <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Background image</FormLabel>
                                <FormControl>
                                    {/* billboard only takes in one image but cloudinary expect an array of image */}
                                    {/* onChange is by reacthookform */}
                                    <ImageUpload
                                        value={field.value ? [field.value] : []}
                                        disabled={loading}
                                        onChange={(url) => field.onChange(url)}
                                        onRemove={() => field.onChange("")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-3 gap-8">
                        <FormField
                            control={form.control}
                            name="label"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Label</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={loading}
                                            placeholder="Billboard label"
                                            {...field}
                                        />
                                    </FormControl>
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

export default BillboardForm;
