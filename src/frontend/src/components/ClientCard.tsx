import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Mail, Phone, Building, Briefcase } from 'lucide-react';
import { AllUserData } from '../backend';

interface ClientCardProps {
  clientData: AllUserData;
}

export default function ClientCard({ clientData }: ClientCardProps) {
  const { userProfile, projects } = clientData;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-lg">{userProfile.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <CardTitle className="text-xl">{userProfile.name}</CardTitle>
            <p className="text-sm text-muted-foreground capitalize">{userProfile.role}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {userProfile.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span>{userProfile.email}</span>
          </div>
        )}

        {userProfile.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{userProfile.phone}</span>
          </div>
        )}

        {userProfile.company && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building className="w-4 h-4" />
            <span>{userProfile.company}</span>
          </div>
        )}

        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="w-4 h-4" />
              <span className="text-sm">Projects</span>
            </div>
            <span className="font-medium text-foreground">{projects.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
