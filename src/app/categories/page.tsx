"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { API_ENDPOINTS, handleApiResponse, createApiRequestOptions } from "@/lib/api";

interface Category {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

interface Event {
  id: number;
  title: string;
  category: number | null;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("Fetching categories from:", API_ENDPOINTS.CATEGORIES);
      const response = await fetch(API_ENDPOINTS.CATEGORIES, createApiRequestOptions('GET'));
      const data = await handleApiResponse<Category[]>(response);
      console.log("Fetched categories:", data);
      setCategories(data);
    } catch (e) {
      console.error("Error fetching categories:", e);
      setError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.EVENTS, createApiRequestOptions('GET'));
      const data = await handleApiResponse<Event[]>(response);
      setEvents(data);
    } catch (e) {
      console.error("Error fetching events:", e);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchEvents();
  }, []);

  const handleAdd = () => {
    setEditCategory(null);
    setTitle("");
    setOpen(true);
  };

  const handleEdit = (cat: Category) => {
    setEditCategory(cat);
    setTitle(cat.title);
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    try {
      await fetch(API_ENDPOINTS.CATEGORY_BY_ID(id.toString()), createApiRequestOptions('DELETE'));
      fetchCategories();
    } catch (e) {
      setError("Failed to delete category");
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setError("");
    try {
      if (editCategory) {
        // Update
        const response = await fetch(
          API_ENDPOINTS.CATEGORY_BY_ID(editCategory.id.toString()), 
          createApiRequestOptions('PUT', { title })
        );
        await handleApiResponse(response);
      } else {
        // Create
        const response = await fetch(
          API_ENDPOINTS.CATEGORIES, 
          createApiRequestOptions('POST', { title })
        );
        await handleApiResponse(response);
      }
      setOpen(false);
      setTitle("");
      setEditCategory(null);
      fetchCategories();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save category");
    }
  };

  const createSampleCategories = async () => {
    const sampleCategories = [
      "Technology",
      "Business",
      "Entertainment", 
      "Sports",
      "Education",
      "Health & Wellness",
      "Food & Dining",
      "Arts & Culture"
    ];

    try {
      for (const title of sampleCategories) {
        const response = await fetch(
          API_ENDPOINTS.CATEGORIES, 
          createApiRequestOptions('POST', { title })
        );
        await handleApiResponse(response);
      }
      fetchCategories();
    } catch (e) {
      setError("Failed to create sample categories");
    }
  };

  // Assignment logic
  const handleAssign = (cat: Category) => {
    setSelectedCategory(cat);
    setSelectedEvents(events.filter(e => e.category === cat.id).map(e => e.id));
    setAssignOpen(true);
  };

  const handleAssignSave = async () => {
    try {
      // For each event, update its category
      await Promise.all(events.map(async (event) => {
        const shouldBeAssigned = selectedEvents.includes(event.id);
        if ((event.category === selectedCategory?.id) !== shouldBeAssigned) {
          const response = await fetch(
            API_ENDPOINTS.EVENT_BY_ID(event.id.toString()), 
            createApiRequestOptions('PATCH', { category: shouldBeAssigned ? selectedCategory?.id : null })
          );
          await handleApiResponse(response);
        }
      }));
      setAssignOpen(false);
      fetchEvents();
    } catch (e) {
      setError("Failed to update event assignments");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-2xl font-bold">Categories Management</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={createSampleCategories}>Create Sample Data</Button>
              <Button onClick={handleAdd}>Add Category</Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-lg">Loading categories...</div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">
              <div className="text-lg font-semibold mb-2">Error</div>
              <div>{error}</div>
              <Button onClick={fetchCategories} className="mt-4">Retry</Button>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-lg font-semibold mb-2">No Categories Found</div>
              <div className="text-gray-600 mb-4">Create your first category to get started.</div>
              <Button onClick={handleAdd}>Create Category</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-mono">{cat.id}</TableCell>
                    <TableCell className="font-semibold">{cat.title}</TableCell>
                    <TableCell>{format(new Date(cat.created_at), "yyyy-MM-dd HH:mm")}</TableCell>
                    <TableCell>{format(new Date(cat.updated_at), "yyyy-MM-dd HH:mm")}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(cat)}>Edit</Button>
                        <Button size="sm" variant="secondary" onClick={() => handleAssign(cat)}>Assign Events</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(cat.id)}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Category Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editCategory ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Category title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit}>{editCategory ? "Update" : "Create"}</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Events Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Events to {selectedCategory?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.map(event => (
              <label key={event.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedEvents.includes(event.id)}
                  onChange={e => {
                    if (e.target.checked) {
                      setSelectedEvents(prev => [...prev, event.id]);
                    } else {
                      setSelectedEvents(prev => prev.filter(id => id !== event.id));
                    }
                  }}
                />
                <span>{event.title}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={handleAssignSave}>Save</Button>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 