
import React, { useState, useRef } from 'react';
import { useEditor, PageElement } from '@/context/EditorContext';
import { cn } from '@/lib/utils';

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
  const { isEditMode, updateElement, selectElement, selectedElementId, userRole } = useEditor();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(element.content);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isSelected = selectedElementId === element.id;
  const canEdit = userRole === 'admin' || userRole === 'editor';
  const isPageTitle = element.type === 'heading' && element.content.includes('Page');

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditMode && canEdit) {
      selectElement(element.id);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditMode && canEdit && (element.type === 'heading' || element.type === 'text' || element.type === 'button')) {
      setIsEditing(true);
      setEditContent(element.content);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editContent !== element.content) {
      updateElement(pageId, sectionId, element.id, {
        content: editContent
      });
      
      // If this is a page title, also update the page title in context
      if (isPageTitle) {
        console.log('Updating page title to:', editContent);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement | HTMLTextAreaElement).blur();
    }
  };
  
  const handleImageClick = () => {
    if (isEditMode && canEdit && element.type === 'image') {
      fileInputRef.current?.click();
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        updateElement(pageId, sectionId, element.id, {
          content: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderElement = () => {
    if (isEditing) {
      if (element.type === 'heading' || element.type === 'button') {
        return (
          <input
            ref={inputRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full bg-white border border-blue-300 p-1 rounded"
          />
        );
      }
      if (element.type === 'text') {
        return (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full min-h-[100px] bg-white border border-blue-300 p-1 rounded"
          />
        );
      }
    }

    switch (element.type) {
      case 'heading':
        return <h2 className={cn(element.properties?.className)}>{element.content}</h2>;
      case 'text':
        return <p className={cn(element.properties?.className)}>{element.content}</p>;
      case 'image':
        return (
          <>
            <img 
              src={element.content} 
              alt="Content" 
              className={cn(element.properties?.className)}
              onClick={handleImageClick}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            {isEditMode && canEdit && element.type === 'image' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white opacity-0 hover:opacity-100 transition-opacity">
                Click to change image
              </div>
            )}
          </>
        );
      case 'button':
        return (
          <button className={cn(element.properties?.className)}>
            {element.content}
          </button>
        );
      default:
        return <div>Unknown element type</div>;
    }
  };

  return (
    <div
      className={cn(
        "relative",
        className,
        isSelected && isEditMode && "outline outline-2 outline-blue-500",
        element.type === 'image' && isEditMode && canEdit && "cursor-pointer relative",
        isEditMode && !isSelected && canEdit && "hover:outline hover:outline-1 hover:outline-blue-300"
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      {renderElement()}
    </div>
  );
};

export default EditableElement;
