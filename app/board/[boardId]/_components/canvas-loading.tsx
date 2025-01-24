

import { Loader } from "lucide-react";
import {  InfoSkeleton } from "./info";
import { ParcipantsSkeleton } from "./parcipants";
import { ToolbarSkeleton } from "./toolbar";

export function Loading() {
    return (
        <main
            className="h-screen w-full relative bg-neutral-100 touch-none flex items-center justify-center">

        <Loader className="h-6 w-6 text-muted-foreground animate-spin"/>
        <InfoSkeleton/>
        <ParcipantsSkeleton/>
        <ToolbarSkeleton/>
        </main>
    )
}