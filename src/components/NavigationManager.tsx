
import React, { useState } from 'react';
import { useEditor } from '@/context/EditorContext';
import { Trash2, PlusCircle, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface MenuItem {
  id: string;
  title: string;
  url: string;
  order: number;
}

export const NavigationManager = () => {
  const { userRole, navigation, updateNavigation } = useEditor();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(navigation || []);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const isAdmin = userRole === 'admin';
  
  const handleAddMenuItem = () => {
    const newMenuItem = {
      id: `menu-item-${Date.now()}`,
      title: 'New Link',
      url: '#',
      order: menuItems.length
    };
    
    setMenuItems([...menuItems, newMenuItem]);
  };
  
  const handleRemoveMenuItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };
  
  const handleUpdateMenuItem = (id: string, field: keyof MenuItem, value: string | number) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };
  
  const handleSaveMenu = () => {
    updateNavigation(menuItems);
    setIsDialogOpen(false);
    toast({
      title: "Navigation Menu Updated",
      description: "Your navigation menu has been updated successfully.",
      variant: "default",
    });
  };
  
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newItems = [...menuItems];
    const draggedItem = newItems[draggedIndex];
    
    // Remove the item being dragged
    newItems.splice(draggedIndex, 1);
    // Insert it at the new position
    newItems.splice(index, 0, draggedItem);
    
    // Update order property for each item
    const reorderedItems = newItems.map((item, idx) => ({
      ...item,
      order: idx
    }));
    
    setMenuItems(reorderedItems);
    setDraggedIndex(index);
  };
  
  if (!isAdmin) return null;
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsDialogOpen(true)}
        className="flex items-center"
      >
        Edit Navigation
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Navigation Menu</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
              <div className="font-medium w-12">Order</div>
              <div className="font-medium flex-1">Title</div>
              <div className="font-medium flex-1">URL</div>
              <div className="w-8"></div>
            </div>
            
            {menuItems.map((item, index) => (
              <div 
                key={item.id} 
                className="flex items-center space-x-2 bg-white p-2 border rounded"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
              >
                <div className="cursor-move">
                  <GripVertical size={16} />
                </div>
                <Input 
                  value={item.title}
                  onChange={(e) => handleUpdateMenuItem(item.id, 'title', e.target.value)}
                  className="flex-1"
                />
                <Input 
                  value={item.url}
                  onChange={(e) => handleUpdateMenuItem(item.id, 'url', e.target.value)}
                  className="flex-1"
                />
                <button 
                  onClick={() => handleRemoveMenuItem(item.id)}
                  className="text-red-500 p-1 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddMenuItem}
              >
                <PlusCircle size={16} className="mr-1" />
                Add Menu Item
              </Button>
              
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveMenu}
                >
                  Save Menu
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
