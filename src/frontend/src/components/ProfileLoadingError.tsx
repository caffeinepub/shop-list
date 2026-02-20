import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import LoginButton from './LoginButton';

interface ProfileLoadingErrorProps {
  error: string;
  onRetry: () => void;
}

export default function ProfileLoadingError({ error, onRetry }: ProfileLoadingErrorProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="max-w-md w-full space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Profile Loading Failed</AlertTitle>
          <AlertDescription>
            {error.includes('timeout') 
              ? 'The profile loading took too long. This might be due to network issues or backend unavailability.'
              : 'An error occurred while loading your profile. Please try again.'}
          </AlertDescription>
        </Alert>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">What you can do:</h2>
          <div className="space-y-3">
            <Button 
              onClick={onRetry} 
              className="w-full"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Loading Profile
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <LoginButton />
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            If the problem persists, please check your internet connection or try again later.
          </p>
        </div>
      </div>
    </div>
  );
}
