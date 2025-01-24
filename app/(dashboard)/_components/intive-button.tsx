import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OrganizationProfile } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
export function InviteButton() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                variant="outline">
                    <Plus className="h-4 mw-4 mr-2"/>
                    Invite members
                </Button>
            </DialogTrigger>
            <DialogContent className="p-0 bg-transparent border-none max-w-[880px]">
            <VisuallyHidden>
                    <DialogTitle>Invite members</DialogTitle>
                </VisuallyHidden>
                <OrganizationProfile routing="hash"/>
            </DialogContent>
        </Dialog>
    )
}