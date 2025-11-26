import { $Enums } from "@/lib/generated/prisma";
import NoAccess from "./no-access";

type AccessContainerProps = {
    children: React.ReactNode;
    hasAccess: boolean;
    resource: $Enums.Resource
}

export default function AccessContainer({ children, hasAccess, resource }: AccessContainerProps) {
    return (
        <>
            {hasAccess ?
                <>
                    {children}
                </>
                : <NoAccess type={resource} />
            }
        </>
    )
}
