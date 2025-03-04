"use client";

import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Link2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/convex/_generated/api";
import { ConfirmModal } from "./confirm-modal";
import { Button } from "./ui/button";
import { useRenameModal } from "@/store/use-rename-modal";

interface ActionProps {
    children: React.ReactNode;
    side?: DropdownMenuContentProps["side"];
    sideOffset?: DropdownMenuContentProps["sideOffset"];
    id: string;
    title: string;
};

export const Actions = ({ children, side, sideOffset, id, title }: ActionProps) => {
    const { onOpen } = useRenameModal();
    const { mutate, pending } = useApiMutation(api.board.remove);

    const onCopyLink = () => {
        navigator.clipboard.writeText(
            `${window.location.origin}/board/${id}`
        )
            .then(() => toast.success("link copied"))
            .catch(() => toast.error("failed to copy link"))
    }
    // console.log(title)

    const onDelete = () => {
        mutate({ id })
            .then(() => toast.success("Board deleted"))
            .catch(() => toast.error("failed to delete"))
    }


    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                side={side}
                sideOffset={sideOffset}
                className="w-60"
                onClick={(e) => e.stopPropagation()}
            >
                <DropdownMenuItem className="p-3 cursor-pointer"
                    onClick={onCopyLink}>
                    <Link2 className="h-4 w-4 mr-2" />
                    Copy board Link
                </DropdownMenuItem>

                <DropdownMenuItem className="p-3 cursor-pointer"
                    onClick={()=>onOpen(id,title)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Rename
                </DropdownMenuItem>


                <ConfirmModal
                    header="Delete board?"
                    description="This will delete the board and all of its contents"
                    disabled={pending}
                    onConfirm={onDelete}

                >
                    <Button
                        variant="ghost"
                        className="p-3 cursor-pointer text-sm w-full justify-start font-normal"
                    // onClick={onDelete}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </ConfirmModal>

            </DropdownMenuContent>
        </DropdownMenu>
    )
}