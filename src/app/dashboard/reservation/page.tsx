import { ReservationForm } from '@/components/forms/reservation-form';
import { ReservationsTable } from '@/components/tables/reservations-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata = {
  title: 'Dashboard : Reservations'
};

export default function ReservationPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Reservations</h1>
        <p className='text-muted-foreground'>
          Manage restaurant reservations and bookings
        </p>
      </div>

      <Tabs defaultValue='new' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='new'>New Reservation</TabsTrigger>
          <TabsTrigger value='manage'>Manage Reservations</TabsTrigger>
        </TabsList>

        <TabsContent value='new' className='space-y-4'>
          <ReservationForm />
        </TabsContent>

        <TabsContent value='manage' className='space-y-4'>
          <ReservationsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
