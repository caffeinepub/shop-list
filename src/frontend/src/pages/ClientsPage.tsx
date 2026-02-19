import { useGetAllUsersData } from '../hooks/useGetAllUsersData';
import { Card, CardContent } from '../components/ui/card';
import ClientCard from '../components/ClientCard';

export default function ClientsPage() {
  const { data: allUsersData, isLoading } = useGetAllUsersData();

  const clients = allUsersData?.filter((userData) => userData.userProfile.role === 'client') || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Clients</h1>
        <p className="text-muted-foreground mt-1">Manage your client relationships</p>
      </div>

      {clients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((clientData) => (
            <ClientCard key={clientData.userProfile.id.toString()} clientData={clientData} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="text-lg font-semibold text-foreground mb-2">No clients yet</h3>
            <p className="text-muted-foreground text-center">Clients will appear here once they register</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
