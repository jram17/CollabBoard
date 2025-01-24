import { List } from "./list";
import { NewButton } from "./new-button";

export function Sidebar(){
    return(
        <div className="z-[1] fixed left-0 bg-blue-950 h-full w-[60px] flex p-3 flex-col gap-y-4 text-white">
            <List/>
            <NewButton/>
        </div>
    )
}