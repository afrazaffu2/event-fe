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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  // const [assignOpen, setAssignOpen] = useState(false);
  // const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  // const [selectedEvents, setSelectedEvents] = useState<number[]>([]);

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("Fetching categories from:", API_ENDPOINTS.CATEGORIES);
      const response = await fetch(API_ENDPOINTS.CATEGORIES, createApiRequestOptions('GET'));
      const data = await handleApiResponse<Category[]>(response);
      console.log("Fetched categories:", data);
      console.log("Sample category data:", data[0]);
      console.log("Categories length:", data.length);
      console.log("Items per page:", itemsPerPage);
      console.log("Total pages:", Math.ceil(data.length / itemsPerPage));
      setCategories(data);
    } catch (e) {
      console.error("Error fetching categories:", e);
      setError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  // const fetchEvents = async () => {
  //   try {
  //     const response = await fetch(API_ENDPOINTS.EVENTS, createApiRequestOptions('GET'));
  //     const data = await handleApiResponse<Event[]>(response);
  //     setEvents(data);
  //   } catch (e) {
  //     console.error("Error fetching events:", e);
  //   }
  // };

  useEffect(() => {
    fetchCategories();
    // fetchEvents();
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

  const handleDeleteClick = (cat: Category) => {
    setCategoryToDelete(cat);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    
    try {
      await fetch(API_ENDPOINTS.CATEGORY_BY_ID(categoryToDelete.id.toString()), createApiRequestOptions('DELETE'));
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (e) {
      setError("Failed to delete category");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
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



  // Assignment logic - commented out for now
  // const handleAssign = (cat: Category) => {
  //   setSelectedCategory(cat);
  //   setSelectedEvents(events.filter(e => e.category === cat.id).map(e => e.id));
  //   setAssignOpen(true);
  // };

  // const handleAssignSave = async () => {
  //   try {
  //     // For each event, update its category
  //     await Promise.all(events.map(async (event) => {
  //       const shouldBeAssigned = selectedEvents.includes(event.id);
  //       if ((event.category === selectedCategory?.id) !== shouldBeAssigned) {
  //         const response = await fetch(
  //           API_ENDPOINTS.EVENT_BY_ID(event.id.toString()), 
  //           createApiRequestOptions('PATCH', { category: shouldBeAssigned ? selectedCategory?.id : null })
  //         );
  //         await handleApiResponse(response);
  //       }
  //     }));
  //     setAssignOpen(false);
  //     fetchEvents();
  //   } catch (e) {
  //     setError("Failed to update event assignments");
  //   }
  // };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-xl">
            <span className="font-semibold">Categories Management</span>
            <div className="flex gap-2">
              <Button 
                onClick={handleAdd}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-4 py-2"
                size="sm"
              >
                Add Category
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
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
            <>
                          <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-16 text-center font-medium text-gray-700 py-3">S.NO</TableHead>
                    <TableHead className="font-medium text-gray-700 py-3">Title</TableHead>
                    <TableHead className="w-32 text-center font-medium text-gray-700 py-3">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((cat, index) => (
                    <TableRow key={cat.id} className="hover:bg-gray-50 border-b">
                      <TableCell className="font-mono text-center py-3 text-sm">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell className="font-medium py-3">{cat.title}</TableCell>
                      <TableCell className="py-3">
                        <div className="flex gap-1 justify-center">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(cat)} className="h-8 px-3 text-xs">Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(cat)} className="h-8 px-3 text-xs">Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 py-3 px-4 bg-gray-50 rounded-lg border">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, categories.length)} of {categories.length} categories
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-8 px-3 text-xs"
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3 text-sm font-medium text-gray-700">
                    Page {currentPage} of {Math.ceil(categories.length / itemsPerPage)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(categories.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(categories.length / itemsPerPage)}
                    className="h-8 px-3 text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
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
            <Button 
              onClick={handleSubmit}
              className={editCategory ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0" : ""}
            >
              {editCategory ? "Update" : "Create"}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md border-0 shadow-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center text-center p-6">
            {/* Warning Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Category</h3>
            
            {/* Message */}
            <p className="text-gray-600 mb-1">
              Are you sure you want to delete
            </p>
            <p className="text-lg font-semibold text-gray-900 mb-6">
              "{categoryToDelete?.title}"?
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
                className="flex-1 h-11 font-medium bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white border-0 shadow-lg !bg-gradient-to-r !from-red-400 !via-red-500 !to-red-600"
                style={{ background: 'linear-gradient(to right, #f87171, #ef4444, #dc2626)' }}
              >
                Delete Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Events Dialog - commented out for now */}
      {/* <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
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
      </Dialog> */}
    </div>
  );
} 