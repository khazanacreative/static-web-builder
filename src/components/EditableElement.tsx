
import React, { useState } from 'react';
import { PageElement } from '@/context/EditorContext';
import { useEditor } from '@/context/EditorContext';
import { cn } from '@/lib/utils';

interface EditableElementProps {
  element: PageElement;
  pageId: string;
  sectionId: string;
}

const EditableElement: React.FC<EditableElementProps> = ({
  element,
  pageId,
  sectionId,
}) => {
  const { isEditMode, updateElement, selectElement, selectedElementId } = useEditor();
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(element.content);

  const isSelected = selectedElementId === element.id;

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    selectElement(element.id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (isEditing) {
      updateElement(pageId, sectionId, element.id, { content: editableContent });
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    }
  };

  const renderElement = () => {
    const className = element.properties?.className || '';

    if (isEditing && element.type !== 'image') {
      return (
        <input
          type="text"
          className={cn(
            className,
            'w-full bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-editor-blue px-2'
          )}
          value={editableContent}
          onChange={(e) => setEditableContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      );
    }

    switch (element.type) {
      case 'heading':
        return <h2 className={className}>{element.content}</h2>;
      case 'text':
        return <p className={className}>{element.content}</p>;
      case 'button':
        return (
          <button className={className} disabled={isEditMode}>
            {element.content}
          </button>
        );
      case 'image':
        return (
          <img
            src={element.content}
            alt="Editable image"
            className={className}
          />
        );
      default:
        return <div className={className}>{element.content}</div>;
    }
  };

  return (
    <div
      className={cn(
        'relative',
        isSelected && isEditMode && 'ring-2 ring-editor-blue ring-inset'
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {renderElement()}
      {isSelected && isEditMode && (
        <div className="absolute -top-4 -left-4 bg-editor-blue text-white text-xs px-2 py-1 rounded-md">
          {element.type}
        </div>
      )}
    </div>
  );
};

export default EditableElement;
