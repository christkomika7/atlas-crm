
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2.5">
            <h2 className="font-semibold text-sm">{title}</h2>
            <div className="space-y-4.5">{children}</div>
        </div>
    );
}

