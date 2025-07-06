"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { API_ENDPOINTS, handleApiResponse, createApiRequestOptions } from "@/lib/api";
import { Wifi, PlusCircle, Car, Coffee, Utensils, WashingMachine, Tv, Music, WifiOff, ParkingCircle, Baby, Dog, Flame, X, User, Stethoscope, Shield, Camera, Mic, Volume2, Monitor, Fan, Snowflake, Sun, Moon, Clock, Calendar, MapPin, Phone, Mail, Globe, Lock, Unlock, Heart, Star, Gift, Trophy, Medal, Crown, Zap, Battery, Plug, Lightbulb, Home, Building, Store, ChefHat, Hotel, School, Building2, Banknote, Mailbox, Library, Landmark, Theater, Users, Map, Waves, Mountain, Trees, Flower, Leaf, Cloud, CloudRain, Wind, Droplets } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Amenity {
  id: number;
  title: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export default function AmenitiesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);

  // Function to get icon based on amenity title
  const getAmenityIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    
    // Transportation & Parking
    if (lowerTitle.includes('parking') || lowerTitle.includes('car') || lowerTitle.includes('vehicle')) return ParkingCircle;
    if (lowerTitle.includes('shuttle') || lowerTitle.includes('transport')) return Car;
    
    // Internet & Technology
    if (lowerTitle.includes('wifi') || lowerTitle.includes('internet') || lowerTitle.includes('wireless')) return Wifi;
    if (lowerTitle.includes('no wifi') || lowerTitle.includes('offline')) return WifiOff;
    if (lowerTitle.includes('projector') || lowerTitle.includes('screen') || lowerTitle.includes('monitor')) return Monitor;
    if (lowerTitle.includes('tv') || lowerTitle.includes('television')) return Tv;
    if (lowerTitle.includes('microphone') || lowerTitle.includes('mic')) return Mic;
    if (lowerTitle.includes('speaker') || lowerTitle.includes('audio')) return Volume2;
    if (lowerTitle.includes('camera') || lowerTitle.includes('photo')) return Camera;
    
    // Food & Beverages
    if (lowerTitle.includes('coffee') || lowerTitle.includes('tea') || lowerTitle.includes('hot drink')) return Coffee;
    if (lowerTitle.includes('food') || lowerTitle.includes('meal') || lowerTitle.includes('dining')) return Utensils;
    if (lowerTitle.includes('restaurant') || lowerTitle.includes('cafe')) return ChefHat;
    if (lowerTitle.includes('bar') || lowerTitle.includes('alcohol') || lowerTitle.includes('drink')) return Coffee;
    
    // Comfort & Environment
    if (lowerTitle.includes('ac') || lowerTitle.includes('air conditioning') || lowerTitle.includes('cooling')) return Snowflake;
    if (lowerTitle.includes('heating') || lowerTitle.includes('warm')) return Sun;
    if (lowerTitle.includes('fan') || lowerTitle.includes('ventilation')) return Fan;
    if (lowerTitle.includes('lighting') || lowerTitle.includes('light')) return Lightbulb;
    
    // Accessibility
    if (lowerTitle.includes('wheelchair') || lowerTitle.includes('accessible') || lowerTitle.includes('disability')) return User;
    if (lowerTitle.includes('baby') || lowerTitle.includes('child') || lowerTitle.includes('kids')) return Baby;
    if (lowerTitle.includes('pet') || lowerTitle.includes('dog') || lowerTitle.includes('animal')) return Dog;
    
    // Safety & Security
    if (lowerTitle.includes('security') || lowerTitle.includes('guard') || lowerTitle.includes('safety')) return Shield;
    if (lowerTitle.includes('first aid') || lowerTitle.includes('medical') || lowerTitle.includes('health')) return Stethoscope;
    if (lowerTitle.includes('fire') || lowerTitle.includes('emergency')) return Flame;
    if (lowerTitle.includes('lock') || lowerTitle.includes('secure')) return Lock;
    
    // Entertainment
    if (lowerTitle.includes('music') || lowerTitle.includes('sound') || lowerTitle.includes('audio')) return Music;
    if (lowerTitle.includes('gaming') || lowerTitle.includes('game')) return Zap;
    if (lowerTitle.includes('gym') || lowerTitle.includes('fitness') || lowerTitle.includes('workout')) return Heart;
    
    // Services
    if (lowerTitle.includes('laundry') || lowerTitle.includes('washing')) return WashingMachine;
    if (lowerTitle.includes('phone') || lowerTitle.includes('call')) return Phone;
    if (lowerTitle.includes('mail') || lowerTitle.includes('email')) return Mail;
    if (lowerTitle.includes('clock') || lowerTitle.includes('time')) return Clock;
    if (lowerTitle.includes('calendar') || lowerTitle.includes('schedule')) return Calendar;
    if (lowerTitle.includes('location') || lowerTitle.includes('map')) return MapPin;
    
    // Smoking
    if (lowerTitle.includes('smoking') || lowerTitle.includes('smoke')) return Flame;
    if (lowerTitle.includes('no smoking') || lowerTitle.includes('non-smoking')) return X;
    
    // Power & Energy
    if (lowerTitle.includes('power') || lowerTitle.includes('electricity') || lowerTitle.includes('outlet')) return Plug;
    if (lowerTitle.includes('battery') || lowerTitle.includes('charging')) return Battery;
    
    // Awards & Recognition
    if (lowerTitle.includes('award') || lowerTitle.includes('trophy') || lowerTitle.includes('prize')) return Trophy;
    if (lowerTitle.includes('medal') || lowerTitle.includes('achievement')) return Medal;
    if (lowerTitle.includes('crown') || lowerTitle.includes('royal')) return Crown;
    if (lowerTitle.includes('star') || lowerTitle.includes('rating')) return Star;
    if (lowerTitle.includes('gift') || lowerTitle.includes('present')) return Gift;
    
    // Default icon
    return Wifi;
  };
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editAmenity, setEditAmenity] = useState<Amenity | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [amenityToDelete, setAmenityToDelete] = useState<Amenity | null>(null);

  const fetchAmenities = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("Fetching amenities from:", API_ENDPOINTS.AMENITIES);
      const response = await fetch(API_ENDPOINTS.AMENITIES, createApiRequestOptions('GET'));
      const data = await handleApiResponse<Amenity[]>(response);
      console.log("Fetched amenities:", data);
      console.log("Sample amenity data:", data[0]);
      console.log("Amenities length:", data.length);
      console.log("Items per page:", itemsPerPage);
      console.log("Total pages:", Math.ceil(data.length / itemsPerPage));
      setAmenities(data);
    } catch (e) {
      console.error("Error fetching amenities:", e);
      setError("Failed to fetch amenities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  const handleAdd = () => {
    setEditAmenity(null);
    setTitle("");
    setOpen(true);
  };

  const handleEdit = (amenity: Amenity) => {
    setEditAmenity(amenity);
    setTitle(amenity.title);
    setOpen(true);
  };

  const handleDeleteClick = (amenityId: number) => {
    const amenity = amenities.find(a => a.id === amenityId);
    if (amenity) {
      setAmenityToDelete(amenity);
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!amenityToDelete) return;
    
    try {
      await fetch(API_ENDPOINTS.AMENITY_BY_ID(amenityToDelete.id.toString()), createApiRequestOptions('DELETE'));
      setDeleteModalOpen(false);
      setAmenityToDelete(null);
      fetchAmenities();
    } catch (e) {
      setError("Failed to delete amenity");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setAmenityToDelete(null);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setError("");
    try {
      if (editAmenity) {
        // Update
        const response = await fetch(
          API_ENDPOINTS.AMENITY_BY_ID(editAmenity.id.toString()), 
          createApiRequestOptions('PUT', { title })
        );
        await handleApiResponse(response);
      } else {
        // Create
        const response = await fetch(
          API_ENDPOINTS.AMENITIES, 
          createApiRequestOptions('POST', { title })
        );
        await handleApiResponse(response);
      }
      setOpen(false);
      setTitle("");
      setEditAmenity(null);
      fetchAmenities();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save amenity");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="bg-gradient-to-r from-blue-700 via-purple-700 to-blue-400 bg-clip-text text-transparent font-extrabold">Amenities Directory</CardTitle>
            <CardDescription className="text-blue-700/80">Browse and manage your event amenities.</CardDescription>
          </div>
          <Button 
            onClick={handleAdd}
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:opacity-90 shadow-lg"
          >
            <PlusCircle className="mr-2 h-4 w-4 text-white" />
            Add Amenity
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-6 pt-6 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">
              <div className="text-lg font-semibold mb-2">Error</div>
              <div>{error}</div>
              <Button onClick={fetchAmenities} className="mt-4">Retry</Button>
            </div>
          ) : amenities.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-lg font-semibold mb-2">No Amenities Found</div>
              <div className="text-gray-600 mb-4">Create your first amenity to get started.</div>
              <Button onClick={handleAdd}>Create Amenity</Button>
            </div>
          ) : (
            <div className="grid gap-6 pt-6 md:grid-cols-2 lg:grid-cols-3">
              {amenities.map((amenity) => (
                <Card key={amenity.id} className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-blue-50 via-purple-50 to-white hover:scale-[1.02] hover:shadow-2xl transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                        {(() => {
                          const IconComponent = getAmenityIcon(amenity.title);
                          return <IconComponent className="h-7 w-7 text-white" />;
                        })()}
                      </div>
                      <div>
                        <CardTitle className="text-lg bg-gradient-to-r from-blue-700 via-purple-700 to-blue-400 bg-clip-text text-transparent font-extrabold">{amenity.title}</CardTitle>
                        <CardDescription className="text-gray-600">
                          Created {format(new Date(amenity.created_at), "MMM dd, yyyy")}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(amenity)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(amenity.id)}>
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

      {/* Add/Edit Amenity Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editAmenity ? "Edit Amenity" : "Add Amenity"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Amenity title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </div>
          <DialogFooter>
            <Button 
              onClick={handleSubmit}
              className={editAmenity ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0" : ""}
            >
              {editAmenity ? "Update" : "Create"}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md border-0 shadow-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Delete Amenity</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center text-center p-6">
            {/* Warning Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Amenity</h3>
            
            {/* Message */}
            <p className="text-gray-600 mb-1">
              Are you sure you want to delete
            </p>
            <p className="text-lg font-semibold text-gray-900 mb-6">
              "{amenityToDelete?.title}"?
            </p>
            
            {/* Buttons */}
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={handleDeleteCancel}
                className="flex-1 h-11 font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                className="flex-1 h-11 font-medium bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white border-0 shadow-lg"
                style={{ background: 'linear-gradient(to right, #f87171, #ef4444, #dc2626)' }}
              >
                Delete Amenity
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 