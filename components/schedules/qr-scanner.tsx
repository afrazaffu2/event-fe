'use client';
import { Scanner as ReactQrScanner } from '@yudiel/react-qr-scanner';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CameraOff, Shield, Globe, QrCode, Keyboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';

type QrScannerProps = {
  onScan: (result: string | null) => void;
};

export function QrScanner({ onScan }: QrScannerProps) {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isSecureContext, setIsSecureContext] = useState<boolean | null>(null);
  const [manualTicketNumber, setManualTicketNumber] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);

  useEffect(() => {
    // Check if we're in a secure context
    const secure = window.isSecureContext;
    setIsSecureContext(secure);
    
    if (!secure) {
      setError('Camera access requires a secure connection (HTTPS or localhost).');
    }
  }, []);

  const handleError = (error: any) => {
    console.error(error);
    let errorMessage = 'Could not scan QR code. Please try again.';
    
    if (error?.name === 'NotAllowedError') {
      errorMessage = 'Camera access was denied. Please enable it in your browser settings.';
      setError(errorMessage);
    } else if (error?.name === 'NotFoundError') {
      errorMessage = 'No camera found. Please ensure a camera is connected and enabled.';
      setError(errorMessage);
    } else if (error?.name === 'NotSupportedError') {
      errorMessage = 'Camera access is not supported in this browser.';
      setError(errorMessage);
    } else if (error?.message?.includes('secure context')) {
      errorMessage = 'Camera access requires a secure connection (HTTPS or localhost).';
      setError(errorMessage);
    }
    
    toast({
      variant: 'destructive',
      title: 'QR Scan Error',
      description: errorMessage,
    });
  };

  const getSecureContextMessage = () => {
    const currentUrl = window.location.href;
    const isLocalhost = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1');
    
    if (isLocalhost) {
      return {
        title: 'Use localhost for camera access',
        description: 'Camera access works on localhost. Please use localhost:9002 instead of the IP address.',
        action: 'Switch to localhost',
        url: currentUrl.replace(/192\.168\.1\.95|127\.0\.0\.1/, 'localhost')
      };
    } else {
      return {
        title: 'Secure connection required',
        description: 'Camera access requires HTTPS or localhost. For mobile access, use localhost on your computer.',
        action: 'Use localhost',
        url: currentUrl.replace(/192\.168\.1\.95/, 'localhost')
      };
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualTicketNumber.trim()) {
      onScan(manualTicketNumber.trim());
      setManualTicketNumber('');
      toast({
        title: 'Ticket Number Entered',
        description: `Processing ticket: ${manualTicketNumber.trim()}`,
      });
    }
  };

  if (error) {
    const secureMessage = getSecureContextMessage();
    
    return (
      <div className="space-y-4">
        <Alert variant="destructive" className="mb-4">
          <CameraOff className="h-4 w-4" />
          <AlertTitle>Camera Access Error</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{error}</p>
            
            {!isSecureContext && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">{secureMessage.title}</p>
                    <p className="text-sm text-yellow-700 mt-1">{secureMessage.description}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => window.location.href = secureMessage.url}
                    >
                      <Globe className="w-3 h-3 mr-1" />
                      {secureMessage.action}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Alternative Solutions:</strong>
                <br />• Use localhost:9002 for camera access
                <br />• Manually enter ticket numbers below
                <br />• Use the "Show URL" button to get activation links
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Manual Ticket Entry */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-3">
            <Keyboard className="h-4 w-4 text-gray-600" />
            <h3 className="font-medium text-gray-900">Manual Ticket Entry</h3>
          </div>
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div>
              <label htmlFor="ticketNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Enter Ticket Number
              </label>
              <Input
                id="ticketNumber"
                type="text"
                placeholder="e.g., T-001, T-002, etc."
                value={manualTicketNumber}
                onChange={(e) => setManualTicketNumber(e.target.value)}
                className="w-full"
              />
            </div>
            <Button 
              type="submit" 
              disabled={!manualTicketNumber.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Process Ticket
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            Enter the ticket number exactly as shown on the ticket (e.g., T-001)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* QR Scanner */}
      <div className="w-full rounded-lg overflow-hidden">
        <ReactQrScanner
          onScan={(result) => {
            if (result && result.length > 0) {
              onScan(result[0].rawValue);
            }
          }}
          onError={handleError}
          scanDelay={300}
        />
      </div>

      <Separator />

      {/* Manual Ticket Entry */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="flex items-center gap-2 mb-3">
          <Keyboard className="h-4 w-4 text-gray-600" />
          <h3 className="font-medium text-gray-900">Manual Ticket Entry</h3>
        </div>
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div>
            <label htmlFor="ticketNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Enter Ticket Number
            </label>
            <Input
              id="ticketNumber"
              type="text"
              placeholder="e.g., T-001, T-002, etc."
              value={manualTicketNumber}
              onChange={(e) => setManualTicketNumber(e.target.value)}
              className="w-full"
            />
          </div>
          <Button 
            type="submit" 
            disabled={!manualTicketNumber.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Process Ticket
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Enter the ticket number exactly as shown on the ticket (e.g., T-001)
        </p>
      </div>
    </div>
  );
}
