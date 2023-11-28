// NOTE: ownself write to revalidate IMPORTANT!

"use server";
import { revalidatePath } from "next/cache";
const clearCachesByServerAction = async (path: string) => {
    console.log("called");
    try {
        // if (path) {
        // revalidatePath(path);
        // } else {

        revalidatePath("/", "layout");
        // }
    } catch (error) {
        console.error("clearCachesByServerAction=> ", error);
    }
};
export default clearCachesByServerAction;
