"use client";

import { Layer } from "@/types/canvas";
import { LiveList, LiveMap, LiveObject } from "@liveblocks/client";
import {
    ClientSideSuspense,
    LiveblocksProvider,
    RoomProvider,
} from "@liveblocks/react/suspense"


interface RoomProps {
    children: React.ReactNode;
    roomId: string;
    fallback: NonNullable<React.ReactNode> | null;
}

export function Room({ children, roomId, fallback }: RoomProps) {
    return (
        <LiveblocksProvider authEndpoint="/api/liveblocks-auth" throttle={16}>
            <RoomProvider
                id={roomId}
                
                initialPresence={{ cursor: null, selection: [] ,pencilDraft:null,penColor:null}}

                initialStorage={{
                    layers: new LiveMap<string, LiveObject<Layer>>(),
                    layerIds: new LiveList([]),
                }}>
                <ClientSideSuspense fallback={fallback}>
                    {() => children}
                </ClientSideSuspense>
            </RoomProvider>
        </LiveblocksProvider>
    )
}