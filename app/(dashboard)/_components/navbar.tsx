"use client";

import { OrganizationSwitcher, useOrganization, UserButton } from "@clerk/nextjs";
import { SearchInput } from "./search-input";
import { InviteButton } from "./intive-button";



export function Navbar() {
    const {organization} = useOrganization();
    return (
        <div className="flex  items-center gap-x-4  p-5 ">
            <div className="hidden lg:flex-1 lg:flex">
                <SearchInput/>
            </div>
            <div className="block lg:hidden flex-1">
            <OrganizationSwitcher
                hidePersonal
                appearance={{
                    elements: {
                        rootBox: {
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                            maxWidth:"376px"
                        },
                        organizationSwitcherTrigger: {
                            padding: "6px",
                            borderRadius: "8px",
                            width: "100%",
                            border: "1px solid #E5E7EB",
                            justifyContent: "space-between",
                            backgroundColor: "#FFFFFF",
                        }
                    }
                }}
            />
            </div>
            {organization && <InviteButton/>}
            <UserButton />
        </div>
    )
}
