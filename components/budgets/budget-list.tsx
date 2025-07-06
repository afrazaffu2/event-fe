'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import type { Host } from '@/types';
import { getHosts } from '@/services/hostService';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { User, PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { HostForm } from './host-form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

export function HostList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchHosts() {
      try {
        setLoading(true);
        const fetchedHosts = await getHosts();
        setHosts(fetchedHosts);
      } catch (error) {
        console.error('Failed to fetch hosts:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch hosts from the database.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchHosts();
  }, [dialogOpen, toast]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Host Directory</CardTitle>
          <CardDescription>Browse and manage your event hosts.</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Hos
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Host</DialogTitle>
            </DialogHeader>
            <HostForm setOpen={setDialogOpen} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-6 pt-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="grid gap-6 pt-6 md:grid-cols-2 lg:grid-cols-3">
            {hosts.map((host) => (
              <Card key={host.id}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage
                        src={`https://i.pravatar.cc/150?u=${host.id}`}
                      />
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{host.name}</CardTitle>
                      <CardDescription>{host.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
