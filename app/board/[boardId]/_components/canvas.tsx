"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Info } from "./info";
import { Participants } from "./parcipants";
import { Toolbar } from "./toolbar";
import { Camera, CanvasMode, CanvasState, Color, LayerType, Point, Side, XYWH } from "@/types/canvas";
import { useCanRedo, useCanUndo, useMutation, useOthersMapped, useSelf, useStorage } from "@liveblocks/react";
import { useHistory } from "@liveblocks/react/suspense"
import { CursorPresence } from "./cursor-presence";
import { colorToCss, connectionIdToColor, findIntersectingLayersWithRectangle, penPointToPathLayer, pointerEventToCanvasPoint, resizeBounds } from "@/lib/utils";
import { nanoid } from "nanoid"
import { LiveObject } from "@liveblocks/client";
import { LayerPreview } from "./layer-preview";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selection-tools";
import { Path } from "./path";
import { useDisableScrollBounce } from "@/hooks/use-disable-scroll-bounce";
import { useDeleteLayers } from "@/hooks/use-delete-layers";

interface CanvasProps {
    boardId: string;
}


const MAX_LAYERS = 100;


export function Canvas({ boardId }: CanvasProps) {
    const layerIds = useStorage((root) => root.layerIds);
    const pencilDraft = useSelf((me) => me.presence.pencilDraft);
    const [canvasState, setCanvasState] = useState<CanvasState>({
        mode: CanvasMode.None
    });

    const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
    const [lastUsedColor, setLastusedColor] = useState<Color>({
        r: 0,
        g: 0,
        b: 255,
    });

    useDisableScrollBounce();
    const history = useHistory();
    const canUndo = useCanUndo();
    const canRedo = useCanRedo();


    // const insertLayer = useMutation((
    //     { storage, setMyPresence },
    //     layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text | LayerType.Note,
    //     position: Point
    // ) => {
    //     const liveLayers = storage.get("layers");
    //     if (liveLayers.size <= MAX_LAYERS) {
    //         return;
    //     }
    //     const liveLayerIds = storage.get("layerIds");
    //     const layerId = nanoid();
    //     const layer = new LiveObject({
    //         type: layerType,
    //         x: position.x,
    //         y: position.y,
    //         height: 100,
    //         width: 100,
    //         fill: lastUsedColor,
    //     });

    //     liveLayerIds.push(layerId);
    //     liveLayers.set(layerId, layer);
    //     setMyPresence({ selection: [layerId] }, { addToHistory: true });
    //     setCanvasState({ mode: CanvasMode.None })
    // }, [lastUsedColor])


    // could not update history so  therefore generated with chatgpt
    const insertLayer = (layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text | LayerType.Note, position: Point) => {
        history.pause();
        try {
            insertLayerMutation(layerType, position);
        } finally {
            history.resume();
        }
    };


    const insertLayerMutation = useMutation(
        ({ storage, setMyPresence }, layerType, position) => {
            const liveLayers = storage.get("layers");
            if (liveLayers.size >= MAX_LAYERS) {
                return;
            }
            const liveLayerIds = storage.get("layerIds");
            const layerId = nanoid();
            const layer = new LiveObject({
                type: layerType,
                x: position.x,
                y: position.y,
                height: 100,
                width: 100,
                fill: lastUsedColor,
            });

            liveLayerIds.push(layerId);
            liveLayers.set(layerId, layer);
            setMyPresence({ selection: [layerId] }, { addToHistory: true });
            setCanvasState({ mode: CanvasMode.None })
        },
        [lastUsedColor]
    );

    const continueDrawing = useMutation((
        { self, setMyPresence },
        point: Point,
        e: React.PointerEvent,
    ) => {
        // console.log("canvas mode:",canvasState.mode)
        const { pencilDraft } = self.presence;
        if (canvasState.mode != CanvasMode.Pencil ||
            e.buttons != 1 ||
            pencilDraft == null
        ) {
            // console.log("hit canvas mode");
            return;
        }
        // console.log("continue drawing")
        setMyPresence({
            cursor: point,
            pencilDraft: pencilDraft.length == 1 &&
                pencilDraft[0][0] == point.x &&
                pencilDraft[0][1] == point.y ?
                pencilDraft : [...pencilDraft, [point.x, point.y, e.pressure]]
        })
    }, [canvasState.mode])

    const insertPath = useMutation((
        { self, setMyPresence, storage },
    ) => {
        console.log("setting path")
        const liveLayers = storage.get("layers");
        const { pencilDraft } = self.presence;
        if (pencilDraft == null ||
            pencilDraft.length < 2 ||
            liveLayers.size >= MAX_LAYERS
        ) {
            setMyPresence({
                pencilDraft: null
            });
            return;
        }
        const id = nanoid();
        liveLayers.set(
            id,
            new LiveObject(penPointToPathLayer(pencilDraft, lastUsedColor)),
        );

        const liveLayerIds = storage.get("layerIds");
        liveLayerIds.push(id);
        setMyPresence({ pencilDraft: null });
        setCanvasState({ mode: CanvasMode.Pencil })

    }, [lastUsedColor])

    const startDrawing = useMutation((
        { setMyPresence },
        point: Point,
        pressure: number
    ) => {
        console.log("started to draw")
        setMyPresence({
            pencilDraft: [[point.x, point.y, pressure]],
            penColor: lastUsedColor
        })
    }, [lastUsedColor])

    const onPointerDown = useCallback((
        e: React.PointerEvent
    ) => {

        const point = pointerEventToCanvasPoint(e, camera);
        if (canvasState.mode === CanvasMode.Inserting) {
            return;
        }
        setCanvasState({ origin: point, mode: CanvasMode.Pressing })

        if (canvasState.mode === CanvasMode.Pencil) {
            // console.log('Switching to Pencil mode');
            setCanvasState({ mode: CanvasMode.Pencil });
            startDrawing(point, e.pressure);
            return;
        }
    }, [camera, canvasState.mode, setCanvasState, startDrawing]);


    const unselectLayer = useMutation((
        { self, setMyPresence }
    ) => {
        if (self.presence.selection.length > 0) {
            setMyPresence({ selection: [] }, { addToHistory: true });
        }
    }, [])

    const onPointerUp = useMutation((
        { }, e
    ) => {
        const point = pointerEventToCanvasPoint(e, camera);

        console.log({ point, mode: canvasState.mode }, "on pointer up")
        console.log(canvasState.mode == CanvasMode.Pencil)
        if (canvasState.mode === CanvasMode.None || canvasState.mode === CanvasMode.Pressing) {
            unselectLayer();
            setCanvasState({ mode: CanvasMode.None })
        } else if (canvasState.mode == CanvasMode.Pencil) {
            console.log("insert path hit")
            insertPath();
        } else if (canvasState.mode === CanvasMode.Inserting) {
            insertLayer(canvasState.layerType, point);
        } else {
            setCanvasState({
                mode: CanvasMode.None,

            })
        }
        history.resume()
    }, [setCanvasState, camera, canvasState, insertLayer, unselectLayer, insertPath]);

    const updateSelectionNet = useMutation((
        { storage, setMyPresence },
        current: Point,
        origin: Point,
    ) => {
        const layers = storage.get("layers").toImmutable();
        // console.log("Updating selection net:", { current, origin });

        setCanvasState({
            mode: CanvasMode.SelectionNet,
            origin,
            current,
        });

        const ids = findIntersectingLayersWithRectangle(layerIds, layers, origin, current);
        setMyPresence({ selection: ids }, { addToHistory: true });
    }, [layerIds]);

    const startMultiSelection = useCallback((
        current: Point,
        origin: Point
    ) => {
        if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
            // console.log("Starting multi-selection:", { current, origin });

            setCanvasState({
                mode: CanvasMode.SelectionNet,
                origin,
                current,
            });
        }
    }, [])


    const resizeSelectedLayer = useMutation((
        { storage, self },
        point: Point
    ) => {
        if (canvasState.mode !== CanvasMode.Resizing) { return; }
        const bounds = resizeBounds(canvasState.initialBounds, canvasState.corner, point);
        const liveLayers = storage.get("layers");
        const layer = liveLayers.get(self.presence.selection[0]);
        if (layer) {
            layer.update(bounds);
        }

    }, [canvasState])


    const onLayerPointerDown = useMutation((
        { self, setMyPresence },
        e: React.PointerEvent,
        layerId: string,
    ) => {

        if (canvasState.mode === CanvasMode.Pencil || canvasState.mode === CanvasMode.Inserting) {
            return;
        }

        history.pause();
        e.stopPropagation();
        const point = pointerEventToCanvasPoint(e, camera);

        if (!self.presence.selection.includes(layerId)) {
            setMyPresence({ selection: [layerId] }, { addToHistory: true });
        }
        setCanvasState({ mode: CanvasMode.Translating, current: point });


    }, [setCanvasState, camera, history, canvasState.mode]);

    const onResizeHandlePointerDown = useCallback((
        corner: Side,
        initialBounds: XYWH,
    ) => {
        console.log({
            corner, initialBounds,
        }, "onResizeHandlePointerDown")
        history.pause();
        setCanvasState({ mode: CanvasMode.Resizing, corner, initialBounds });
    }, [history])




    const onWheel = useCallback((e: React.WheelEvent) => {
        // console.log({x:e.deltaX,y:e.deltaY});
        setCamera((camera) => ({
            x: camera.x - e.deltaX,
            y: camera.y - e.deltaY,
        }))
    }, []);

    const translateSelectedLayers = useMutation((
        { storage, self },
        point: Point,
    ) => {
        if (canvasState.mode !== CanvasMode.Translating) { return; }
        const offset = {
            x: point.x - canvasState.current.x,
            y: point.y - canvasState.current.y
        }
        const liveLayers = storage.get("layers");

        for (const id of self.presence.selection) {
            const layer = liveLayers.get(id);
            if (layer) {
                layer.update({
                    x: layer.get("x") + offset.x,
                    y: layer.get("y") + offset.y
                })
            }
        }

        setCanvasState({ mode: CanvasMode.Translating, current: point })
    }, [canvasState])

    const onPointerMove = useMutation(({ setMyPresence }, e: React.PointerEvent) => {

        e.preventDefault();
        const current = pointerEventToCanvasPoint(e, camera);
        if (canvasState.mode === CanvasMode.Pressing) {
            startMultiSelection(current, canvasState.origin)
        } else if (canvasState.mode === CanvasMode.SelectionNet) {
            updateSelectionNet(current, canvasState.origin)
        } else if (canvasState.mode === CanvasMode.Translating) {
            translateSelectedLayers(current)
        } else if (canvasState.mode === CanvasMode.Resizing) {
            resizeSelectedLayer(current)
        } else if (canvasState.mode === CanvasMode.Pencil) {
            // console.log("canvas changed to Pencil")
            continueDrawing(current, e);
        }

        setMyPresence({ cursor: current })
    }, [canvasState,
        resizeSelectedLayer,
        camera,
        translateSelectedLayers,
        continueDrawing,
        startMultiSelection,
        updateSelectionNet
    ])

    const onPointerLeave = useMutation(({ setMyPresence }) => {
        setMyPresence({ cursor: null });
    }, [])


    const seletions = useOthersMapped((other) => other.presence.selection);
    const layerIdsToColorSelection = useMemo(() => {
        const layerIdsToColorSelection: Record<string, string> = {};

        for (const user of seletions) {
            const [connectionId, selection] = user;
            for (const layerId of selection) {
                layerIdsToColorSelection[layerId] = connectionIdToColor(connectionId);
            }
        }

        return layerIdsToColorSelection;
    }, [seletions])

    const deleteLayer = useDeleteLayers();


    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            switch (e.key) {

                // case "Backspace":
                //     deleteLayer();
                //     break;
                case 'z':
                    if (e.ctrlKey || e.metaKey) {
                        if (e.shiftKey) {
                            history.redo();
                        } else {
                            history.undo();
                        }
                        break;
                    }
            }
        }

        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [deleteLayer, history])

    return (
        <main
            className="h-screen w-full relative bg-neutral-100 touch-none">
            <Info boardId={boardId} />
            <Participants />
            <Toolbar
                canvasState={canvasState}
                setCanvasState={setCanvasState}
                canRedo={canRedo}
                canUndo={canUndo}
                undo={history.undo}
                redo={history.redo}
            />
            <SelectionTools
                camera={camera}
                setLastUsedColor={setLastusedColor}
            />
            <svg
                onWheel={onWheel}
                onPointerUp={onPointerUp}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}
                className="h-[100vh] w-[100vw] ">
                <g style={{
                    transform: `translate(${camera.x}px,${camera.y}px )`
                }}>
                    {layerIds?.map((layerId) => (
                        <LayerPreview
                            key={layerId}
                            id={layerId}
                            onLayerPointerDown={onLayerPointerDown}
                            selectionColor={layerIdsToColorSelection[layerId]}
                        />
                    ))}
                    <SelectionBox
                        onResizeHandlePointerDown={onResizeHandlePointerDown}
                    />
                    <CursorPresence />
                    {pencilDraft != null && pencilDraft.length > 0 && (
                        <Path
                            points={pencilDraft}
                            fill={colorToCss(lastUsedColor)}
                            x={0}
                            y={0}
                        />
                    )}
                </g>
            </svg>
        </main>
    )
}

