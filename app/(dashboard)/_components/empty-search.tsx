import Image from "next/image";

export function EmptySearch() {

    return (
        <div className="h-full flex flex-col items-center justify-center rounded-md">
            <Image src="/empty-searchOne.png"
                height={360}
                width={360}
                alt="Empty" />
                <h2 className="text-2xl font-semibold mt-6">No results found!</h2>
                <p className="text-muted-foreground text-sm mt-2">Try searching for something else</p>
        </div>
    )
}