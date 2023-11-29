"use client";

import * as z from "zod";
import { useState } from "react";
import { Billboard, Category } from "@prisma/client";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CategoryFormProps {
    // there is a chance that billboard is not found
    initialData: Category | null;
    billboards: Billboard[];
}

const formSchema = z.object({
    name: z.string().min(1),
    billboardId: z.string().min(1),
});

type CategoryFormValues = z.infer<typeof formSchema>;

const CategoryForm: React.FC<CategoryFormProps> = ({
    initialData,
    billboards,
}) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? "Edit category" : "Create category";
    const description = initialData ? "Edit a category" : "Add a new category";
    const toastMessage = initialData
        ? "Category updated."
        : "Category created.";
    const action = initialData ? "Save changes" : "Create";

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            billboardId: "",
        },
    });

    const params = useParams();
    const router = useRouter();

    // can be called data or values doesnt matter
    // #DBG: Sometimes when you perform CRUD, u need refresh to get update because i think db not done then  upush therer alrdy
    // #NOTE: Changed to promise based toaster
    const onSubmit = async (data: CategoryFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
                const updatePromise = toast.promise(
                    axios.patch(
                        `/api/${params.storeId}/categories/${params.categoryId}`,
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
                    axios.post(`/api/${params.storeId}/categories`, data),
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
            router.push(`/${params.storeId}/categories`);

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
                    `/api/${params.storeId}/categories/${params.categoryId}`
                ),
                {
                    loading: "Deleting...",
                    success: "Category deleted",
                    error: "Make sure you removed all products using this category first",
                }
            );
            await deletePromise;
            clearCachesByServerAction(`/`);
            router.refresh();
            router.push(`/${params.storeId}/categories`);
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
                                            placeholder="Category Name"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="billboardId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Billboard</FormLabel>
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
                                                    placeholder="Select a billboard"
                                                ></SelectValue>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {billboards.map((billboard) => (
                                                <SelectItem
                                                    key={billboard.id}
                                                    value={billboard.id}
                                                >
                                                    {billboard.label}
                                                </SelectItem>
                                            ))}
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

export default CategoryForm;
