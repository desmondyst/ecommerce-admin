import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function SetupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const store = await prismadb.store.findFirst({
        where: {
            userId,
        },
    });

    //NOTE: if there is a store, we redirect, else we keep it here and open the modal
    if (store) {
        redirect(`/${store.id}`);
    }

    return <>{children}</>;
}
