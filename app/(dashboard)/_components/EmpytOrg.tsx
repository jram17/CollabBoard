import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateOrganization } from "@clerk/nextjs";
import Image from "next/image";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export function EmptyOrg() {
    return (
        <div className="h-full flex flex-col items-center justify-center ">
            <Image
                src="/elements.svg"
                alt="elements"
                height={200}
                width={200}
            />
            <h2 className="text-2xl font-semibold mt-6">
                Welcome to Draw
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
                Create an organization to get started
            </p>
            <div className="mt-6">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="lg">
                            Create Organization
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="p-0 bg-transparent border-none w-fit ">
                    <VisuallyHidden>
                    <DialogTitle>Invite members</DialogTitle>
                </VisuallyHidden>
                        <CreateOrganization/>
                    </DialogContent>
                </Dialog>
            </div>

        </div >
    );
}