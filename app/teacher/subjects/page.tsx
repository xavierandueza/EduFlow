import { Card } from '../../ui/teacher/cards'; 
import { Suspense } from 'react';
 
export default async function Page() {
 
  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl">
        Classes
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Biology" value="class1" classId = "101"/>
        <Card title="Pending" value="class2" type="pending" />
        <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
        <Card
          title="Total Customers"
          value={numberOfCustomers}
          type="customers"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <LatestInvoices latestInvoices={latestInvoices} />
      </div>
    </main>
  );
}