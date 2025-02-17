"use client";

import * as z from "zod";
import { useState } from "react";
import { Color } from "@prisma/client";
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
import clearCachesByServerAction from "../../components/reset-cache";

interface ColorFormProps {
    initialData: Color | null;
}

const formSchema = z.object({
    name: z.string().min(1),
    // NOTE: different from size here
    value: z.string().min(4).regex(/^#/, {
        message: "String must be a valid hex code",
    }),
});

type ColorFormValues = z.infer<typeof formSchema>;

const ColorForm: React.FC<ColorFormProps> = ({ initialData }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? "Edit color" : "Create color";
    const description = initialData ? "Edit a color" : "Add a new color";
    const toastMessage = initialData ? "Color updated." : "Color created.";
    const action = initialData ? "Save changes" : "Create";

    const form = useForm<ColorFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            value: "",
        },
    });

    const params = useParams();
    const router = useRouter();

    // can be called data or values doesnt matter
    // #DBG: Sometimes when you perform CRUD, u need refresh to get update because i think db not done then  upush therer alrdy
    // #NOTE: Changed to promise based toaster
    const onSubmit = async (data: ColorFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
                const updatePromise = toast.promise(
                    axios.patch(
                        `/api/${params.storeId}/colors/${params.colorId}`,
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
                    axios.post(`/api/${params.storeId}/colors`, data),
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
            router.push(`/${params.storeId}/colors`);

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
                axios.delete(`/api/${params.storeId}/colors/${params.colorId}`),
                {
                    loading: "Deleting...",
                    success: "Color deleted",
                    error: "Make sure you removed all products using this color first",
                }
            );
            await deletePromise;
            clearCachesByServerAction(`/`);
            router.refresh();
            router.push(`/${params.storeId}/colors`);
            // toast.success("Color deleted");
        } catch (error) {
            console.log(error);
            // toast.error(
            // "Make sure you removed all products using this color first"
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
                    <div className="grid grid-cols-3 gap-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={loading}
                                            placeholder="Color name"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="value"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Value</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center gap-x-4">
                                            <Input
                                                disabled={loading}
                                                placeholder="Color value"
                                                {...field}
                                            />
                                            <div
                                                className="border p-4 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        field.value,
                                                }}
                                            />
                                        </div>
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

export default ColorForm;
