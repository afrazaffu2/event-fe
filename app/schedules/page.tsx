import { ScheduleTable } from "@/components/schedules/schedule-table";

export default function BookingsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Bookings
            </h1>
            <p className="text-muted-foreground">
                View and manage event bookings and scan QR codes for attendance.
            </p>
            <ScheduleTable />
        </div>
    );
}
