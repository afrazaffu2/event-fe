import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin } from 'lucide-react';

export function ContactHost() {
  return (
    <Card className="w-64 shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-center">Contact Host</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-md">
            <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Email</p>
            <p className="text-xs text-muted-foreground">contact@aievents.com</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
          <div className="p-1.5 bg-green-100 dark:bg-green-900/50 rounded-md">
            <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Phone</p>
            <p className="text-xs text-muted-foreground">+1 (555) 123-4567</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
          <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-md">
            <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Location</p>
            <p className="text-xs text-muted-foreground">Event Venue</p>
          </div>
        </div>
        
        <Button className="w-full mt-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
          Get Support
        </Button>
      </CardContent>
    </Card>
  );
} 