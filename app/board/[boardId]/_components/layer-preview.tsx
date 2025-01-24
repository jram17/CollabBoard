"use client";

import { LayerType } from "@/types/canvas";
import { useStorage } from "@liveblocks/react";
import { memo } from "react";
import { Rectangle } from "./rectangle";
import { Ellipse } from "./ellipse";
import { Text } from "./text";
import { Note } from "./note";
import { Path } from "./path";
import { colorToCss } from "@/lib/utils";

interface LayerPreviewProps {
    id: string;
    onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
    selectionColor?: string;


}


export const LayerPreview = memo(({ id, onLayerPointerDown, selectionColor }: LayerPreviewProps) => {
    const layer = useStorage((root) => root.layers.get(id));

    if (!layer) {
        return null;
    }

    switch (layer.type) {

        case LayerType.Path:
            return (
                <Path

                    key={id}
                    points={layer.points}
                    onPointerDown={(e)=>onLayerPointerDown(e,id)}
                    x={layer.x}
                    y={layer.y}
                    fill={layer.fill ?colorToCss(layer.fill):"#000"}
                    stroke={selectionColor}
                />
            )
        case LayerType.Note:
            return (
                <Note
                    id={id}
                    layer={layer}
                    onPointerDown={onLayerPointerDown}
                    selectionColor={selectionColor}
                />
            )

        case LayerType.Text:
            return (
                <Text
                    id={id}
                    layer={layer}
                    onPointerDown={onLayerPointerDown}
                    selectionColor={selectionColor}
                />
            )
        case LayerType.Ellipse:
            return (
                <Ellipse
                    id={id}
                    layer={layer}
                    onPointerDown={onLayerPointerDown}
                    selectionColor={selectionColor}
                />
            )
        case LayerType.Rectangle:
            return (
                <Rectangle id={id} onPointerDown={onLayerPointerDown} selectionColor={selectionColor} layer={layer} />
            )
        default:
            // console.warn("unkown layer type");
            return null;

    }

});


LayerPreview.displayName = "LayerPreview";
