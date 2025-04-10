
import React, { useState, useRef, useEffect } from 'react';
import { PageElement } from '@/context/EditorContext';
import { useEditor } from '@/context/EditorContext';
import { cn } from '@/lib/utils';
import { Trash2, Image } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EditableElementProps {
  element: PageElement;
  pageId: string;
  sectionId: string;
  className?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

const EditableElement: React.FC<EditableElementProps> = ({ 
  element, 
  pageId, 
  sectionId, 
  className,
  draggable = false,
  onDragStart
}) => {
  const { 
    isEditMode, 
    selectElement, 
    selectedElementId, 
    updateElement,
    removeElement,
    userRole 
  } = useEditor();
  
  const elementRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(element.content);
  const [imgDialogOpen, setImgDialogOpen] = useState(false);
  
  const canEdit = userRole === 'admin' || userRole === 'editor';
  const isSelected = selectedElementId === element.id;

  useEffect(() => {
    setEditableContent(element.content);
  }, [element.content]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditMode || !canEdit) return;
    
    selectElement(element.id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditMode || !canEdit) return;
    
    if (element.type === 'heading' || element.type === 'text' || element.type === 'button') {
      setIsEditing(true);
    } else if (element.type === 'image') {
      setImgDialogOpen(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    
    if (editableContent !== element.content) {
      updateElement(pageId, sectionId, element.id, { content: editableContent });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditMode || !canEdit) return;
    
    removeElement(pageId, sectionId, element.id);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        updateElement(pageId, sectionId, element.id, { 
          content: reader.result as string 
        });
        setImgDialogOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string) => {
    updateElement(pageId, sectionId, element.id, { 
      content: url 
    });
    setImgDialogOpen(false);
  };

  const renderElement = () => {
    switch (element.type) {
      case 'heading':
        return isEditing ? (
          <textarea
            value={editableContent}
            onChange={(e) => setEditableContent(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full p-1 border rounded"
            autoFocus
          />
        ) : (
          <h2 className={element.properties?.className}>{element.content}</h2>
        );
      
      case 'text':
        return isEditing ? (
          <textarea
            value={editableContent}
            onChange={(e) => setEditableContent(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full p-1 border rounded min-h-[100px]"
            autoFocus
          />
        ) : (
          <p className={element.properties?.className}>{element.content}</p>
        );
      
      case 'button':
        return isEditing ? (
          <input
            type="text"
            value={editableContent}
            onChange={(e) => setEditableContent(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="p-1 border rounded"
            autoFocus
          />
        ) : (
          <button className={element.properties?.className}>
            {element.content}
          </button>
        );
      
      case 'image':
        return (
          <img
            src={element.content}
            alt="Content"
            className={element.properties?.className}
          />
        );
      
      default:
        return <div>Unknown element type: {element.type}</div>;
    }
  };

  return (
    <>
      <div
        ref={elementRef}
        className={cn(
          'relative',
          isEditMode && canEdit && 'hover:outline hover:outline-blue-400',
          isSelected && 'outline outline-blue-600 outline-2',
          className
        )}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        draggable={draggable}
        onDragStart={onDragStart}
      >
        {renderElement()}
        
        {isEditMode && canEdit && isSelected && (
          <button
            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            onClick={handleDelete}
            title="Delete element"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <Dialog open={imgDialogOpen} onOpenChange={setImgDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Upload Image</label>
              <Input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload an image from your device
              </p>
            </div>
            
            <div className="border-t pt-4">
              <label className="block font-medium mb-1">Image URL</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  defaultValue={element.content}
                />
                <Button 
                  onClick={() => handleImageUrlChange(
                    (document.querySelector('input[placeholder="https://example.com/image.jpg"]') as HTMLInputElement).value
                  )}
                >
                  Use URL
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter a URL to an external image
              </p>
            </div>
            
            <div className="border p-3 rounded flex justify-center">
              <img 
                src={element.content} 
                alt="Preview" 
                className="max-h-40 object-contain" 
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditableElement;
