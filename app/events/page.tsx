import { EventTable } from "@/components/events/event-table";

export default function EventsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Events
            </h1>
            <p className="text-muted-foreground">
                Create, manage, and publish all your events.
            </p>
            <EventTable />
        </div>
    );
}