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
import { getHosts, deleteHost } from '@/services/hostService';
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingHost, setEditingHost] = useState<Host | null>(null);
  const { toast } = useToast();

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

  useEffect(() => {
    fetchHosts();
    // eslint-disable-next-line
  }, [dialogOpen, editDialogOpen]);

  async function handleDeleteHost(id: string) {
    if (!window.confirm('Are you sure you want to delete this host?')) return;
    try {
      await deleteHost(id);
      toast({ title: 'Host Deleted', description: 'The host has been deleted.' });
      fetchHosts();
    } catch (error) {
      console.error('Failed to delete host:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not delete the host. Please try again.',
      });
    }
  }

  function handleEditHost(host: Host) {
    setEditingHost(host);
    setEditDialogOpen(true);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="bg-gradient-to-r from-blue-700 via-purple-700 to-blue-400 bg-clip-text text-transparent font-extrabold">Host Directory</CardTitle>
          <CardDescription className="text-blue-700/80">Browse and manage your event hosts.</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:opacity-90 shadow-lg">
              <PlusCircle className="mr-2 h-4 w-4 text-white" />
              Create Host
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Host</DialogTitle>
            </DialogHeader>
            <HostForm setOpen={setDialogOpen} />
          </DialogContent>
        </Dialog>
        {/* Edit Host Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Host</DialogTitle>
            </DialogHeader>
            {editingHost && (
              <HostForm setOpen={setEditDialogOpen} initialData={editingHost} />
            )}
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
              <Card key={host.id} className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-blue-50 via-purple-50 to-white hover:scale-[1.02] hover:shadow-2xl transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 shadow-md">
                      <AvatarImage
                        src={`https://i.pravatar.cc/150?u=${host.id}`}
                      />
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg bg-gradient-to-r from-blue-700 via-purple-700 to-blue-400 bg-clip-text text-transparent font-extrabold">{host.name}</CardTitle>
                      <CardDescription className="text-gray-600">{host.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleEditHost(host)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteHost(host.id)}>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
