"use client";

import Image from "next/image";
import { useOrganization, useOrganizationList, } from '@clerk/nextjs';

import { cn } from "@/lib/utils";
import { Hint } from "@/components/hint";

interface itemProps {
    id: string;
    name: string;
    imageUrl: string;
}

export function Item({
    id, name, imageUrl
}: itemProps) {

    const {organization}=useOrganization();
    const {setActive}=useOrganizationList();

    const isActive = organization?.id === id;

    const onClick = () =>{
        if(!setActive) return null;
        setActive({organization:id});
    }

    return (
        <div className="aspect-square relative">
            <Hint label={name}
            side="right" 
            align="start"
            sideOffset={18}>
                            <Image
                fill
                src={imageUrl}
                onClick={onClick}
                alt={name}
                className={cn("rounded-md cursor-pointer opacity-75 hover:opacity-100 transition",
                    isActive && "bg-opacity-100"
                ) }
            />
            </Hint>


        </div>
    )
}