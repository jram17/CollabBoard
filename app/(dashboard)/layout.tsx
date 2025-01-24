import { Navbar } from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";
import { OrgSidebar } from "./_components/sidebar/org-sidebar";

interface dashboardLayoutProps {
    children: React.ReactNode;
};

const dashboardLayout = ({ children }: dashboardLayoutProps) => {
    return (
        <div className="h-full">
            <Sidebar />
            <div className="pl-[60px] h-full ">
                <div className="flex gap-x-3 h-full  ">
                    <OrgSidebar />
                    <div className="h-full flex-1">
                        <Navbar />
                        {children}
                    </div>
                </div>
            </div>

        </div>
    );
}

export default dashboardLayout;