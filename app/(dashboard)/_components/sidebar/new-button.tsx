"use client";

import { Plus } from "lucide-react";
import { CreateOrganization } from "@clerk/nextjs";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Hint } from "@/components/hint";
export function NewButton() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="aspect-square">
                    <Hint label="Create organization"
                    side="right" 
                    align="start" 
                    sideOffset={18}>
                    <button className="bg-white/25 h-full w-full rounded-md flex items-center justify-center opacity-60 hover:opacity-100 transition ">
                        <Plus className="text-white" />
                    </button>
                    </Hint>
                </div>
            </DialogTrigger>
            <DialogContent className="rounded-md p-0 border-none max-w-[432px]">
                <VisuallyHidden>
                    <DialogTitle>Create Organization</DialogTitle>
                </VisuallyHidden>
                <CreateOrganization />
            </DialogContent>

        </Dialog>
    )
}