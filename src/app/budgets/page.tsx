import { HostList } from "@/components/budgets/budget-list";

export default function HostsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Hosts
            </h1>
            <p className="text-muted-foreground">
                Manage hosts and assign them to events.
            </p>
            <HostList />
        </div>
    );
}
