import { $Enums } from "@/lib/generated/prisma";
import NoAccess from "./no-access";
import Spinner from "../ui/spinner";

type AccessContainerProps = {
    children: React.ReactNode;
    hasAccess: boolean;
    resource: $Enums.Resource;
    loading?: boolean;
}

export default function AccessContainer({ children, hasAccess, resource, loading }: AccessContainerProps) {
    if (loading) return <Spinner />
    return (
        <div className="w-full">
            {hasAccess ?
                <>
                    {children}
                </>
                : <NoAccess type={resource as unknown as import("./no-access").NoAccessResource} />
            }
        </div>
    )
}
