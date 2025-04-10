
import React, { useState } from 'react';
import { PageElement } from '@/context/EditorContext';
import { useEditor } from '@/context/EditorContext';
import { cn } from '@/lib/utils';

interface EditableElementProps {
  element: PageElement;
  pageId: string;
  sectionId: string;
  className?: string;
}

const EditableElement: React.FC<EditableElementProps> = ({ element, pageId, sectionId, className }) => {
  const { isEditMode, selectedElementId, selectElement, updateElement } = useEditor();
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(element.content);

  const isSelected = selectedElementId === element.id;

  const handleElementClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditMode) {
      selectElement(element.id);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditMode && ['heading', 'text', 'button'].includes(element.type)) {
      setIsEditing(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditableContent(e.target.value);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    updateElement(pageId, sectionId, element.id, { content: editableContent });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleInputBlur();
    }
  };

  const renderElement = () => {
    switch (element.type) {
      case 'heading':
        return isEditing ? (
          <input
            type="text"
            value={editableContent}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 border border-editor-blue rounded"
            autoFocus
          />
        ) : (
          <h2 className={element.properties?.className}>{element.content}</h2>
        );
      case 'text':
        return isEditing ? (
          <textarea
            value={editableContent}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-full h-24 px-2 py-1 border border-editor-blue rounded"
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
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 border border-editor-blue rounded"
            autoFocus
          />
        ) : (
          <button className={element.properties?.className}>{element.content}</button>
        );
      case 'image':
        return <img src={element.content} alt="Content" className={element.properties?.className} />;
      default:
        return <div>Unknown element type</div>;
    }
  };

  return (
    <div
      className={cn(
        isSelected && isEditMode ? 'ring-2 ring-editor-blue ring-offset-2' : '',
        isEditMode ? 'cursor-pointer hover:outline hover:outline-dashed hover:outline-gray-300' : '',
        className // Add grid positioning classes
      )}
      onClick={handleElementClick}
      onDoubleClick={handleDoubleClick}
    >
      {renderElement()}
    </div>
  );
};

export default EditableElement;
