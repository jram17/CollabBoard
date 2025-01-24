"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
// import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import { useApiMutation } from "@/hooks/use-api-mutation";
import {toast} from "sonner"
import { useRouter } from "next/navigation";
export function EmptyBoards() {
    const router = useRouter();
    const {organization} =  useOrganization();
    const {mutate,pending}=useApiMutation(api.board.create);

    const onClick=()=>{
        if(!organization) return;

        mutate({
            orgId:organization.id,
            title:"untitled",
        }).then((id)=>{
            toast.success("Board created ");
            router.push(`/board/${id}`)
            
        }).catch(()=>{
            toast.error("failed to create board")   
        })
    }

    return (
        <div className="h-full flex flex-col items-center justify-center rounded-md">
            <Image src="/empty-noteOne.svg"
                height={200}
                width={200}
                alt="Empty" />
                <h2 className="text-2xl font-semibold mt-6">Create your first board</h2>
                <p className="text-muted-foreground text-sm mt-2">Start by creating a board for your organization </p>
                <div className="mt-6">
                    <Button size="lg" onClick={onClick} disabled={pending}>
                        Create board
                    </Button>
                </div>
        </div>
    )
}