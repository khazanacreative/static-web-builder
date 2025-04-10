
import React from 'react';
import { Section } from '@/context/EditorContext';
import { useEditor } from '@/context/EditorContext';
import EditableElement from './EditableElement';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Copy, Trash2, Plus } from 'lucide-react';

interface EditableSectionProps {
  section: Section;
  pageId: string;
}

const EditableSection: React.FC<EditableSectionProps> = ({ section, pageId }) => {
  const { 
    isEditMode, 
    removeSection, 
    duplicateSection, 
    moveSectionUp, 
    moveSectionDown,
    addElement
  } = useEditor();

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateSection(pageId, section.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeSection(pageId, section.id);
  };

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveSectionUp(pageId, section.id);
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveSectionDown(pageId, section.id);
  };

  const handleAddHeading = () => {
    addElement(pageId, section.id, {
      id: `element-${Date.now()}-heading`,
      type: 'heading',
      content: 'New Heading',
      properties: {
        className: 'text-2xl font-bold mb-4'
      }
    });
  };

  const handleAddText = () => {
    addElement(pageId, section.id, {
      id: `element-${Date.now()}-text`,
      type: 'text',
      content: 'New paragraph text',
      properties: {
        className: 'mb-4'
      }
    });
  };

  const handleAddButton = () => {
    addElement(pageId, section.id, {
      id: `element-${Date.now()}-button`,
      type: 'button',
      content: 'Click Me',
      properties: {
        className: 'bg-editor-blue text-white px-4 py-2 rounded-md hover:bg-blue-700'
      }
    });
  };

  const handleAddImage = () => {
    addElement(pageId, section.id, {
      id: `element-${Date.now()}-image`,
      type: 'image',
      content: '/placeholder.svg',
      properties: {
        className: 'w-full max-w-md mx-auto mb-4'
      }
    });
  };

  return (
    <div
      className={cn(
        'relative',
        section.properties?.backgroundColor || 'bg-white',
        section.properties?.paddingY || 'py-8',
        section.properties?.paddingX || 'px-4'
      )}
    >
      <div className="container mx-auto">
        {section.elements.map((element) => (
          <EditableElement
            key={element.id}
            element={element}
            pageId={pageId}
            sectionId={section.id}
          />
        ))}

        {isEditMode && (
          <div className="flex justify-center mt-6">
            <div className="bg-gray-100 p-2 rounded-lg inline-flex gap-2">
              <button
                onClick={handleAddHeading}
                className="bg-white px-3 py-1 rounded text-sm hover:bg-gray-50"
              >
                + Heading
              </button>
              <button
                onClick={handleAddText}
                className="bg-white px-3 py-1 rounded text-sm hover:bg-gray-50"
              >
                + Text
              </button>
              <button
                onClick={handleAddButton}
                className="bg-white px-3 py-1 rounded text-sm hover:bg-gray-50"
              >
                + Button
              </button>
              <button
                onClick={handleAddImage}
                className="bg-white px-3 py-1 rounded text-sm hover:bg-gray-50"
              >
                + Image
              </button>
            </div>
          </div>
        )}
      </div>

      {isEditMode && (
        <div className="absolute top-2 right-2 bg-white shadow-lg rounded-md flex">
          <button
            onClick={handleMoveUp}
            className="p-1 hover:bg-gray-100"
            title="Move Up"
          >
            <ArrowUp size={16} />
          </button>
          <button
            onClick={handleMoveDown}
            className="p-1 hover:bg-gray-100"
            title="Move Down"
          >
            <ArrowDown size={16} />
          </button>
          <button
            onClick={handleDuplicate}
            className="p-1 hover:bg-gray-100"
            title="Duplicate Section"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-gray-100 text-red-500"
            title="Delete Section"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default EditableSection;
