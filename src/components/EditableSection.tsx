
import React, { useState } from 'react';
import { Section } from '@/context/EditorContext';
import { useEditor } from '@/context/EditorContext';
import EditableElement from './EditableElement';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Copy, Trash2, Grid3X3, LayoutGrid } from 'lucide-react';

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
    addElement,
    updateSection,
    userRole
  } = useEditor();
  
  const [showGridSettings, setShowGridSettings] = useState(false);
  
  const canEdit = userRole === 'admin' || userRole === 'editor';

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

  const toggleGridLayout = () => {
    updateSection(pageId, section.id, {
      properties: {
        ...section.properties,
        isGridLayout: !section.properties?.isGridLayout,
        gridColumns: section.properties?.gridColumns || 'grid-cols-1 md:grid-cols-3',
        gridRows: section.properties?.gridRows || 'auto',
        gridGap: section.properties?.gridGap || 'gap-4'
      }
    });
  };

  const handleGridColumnsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSection(pageId, section.id, {
      properties: {
        ...section.properties,
        gridColumns: e.target.value
      }
    });
  };

  const handleGridGapChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSection(pageId, section.id, {
      properties: {
        ...section.properties,
        gridGap: e.target.value
      }
    });
  };

  // Determine if this section uses grid layout
  const isGridLayout = section.properties?.isGridLayout;

  return (
    <div
      className={cn(
        'relative',
        section.properties?.backgroundColor || 'bg-white',
        section.properties?.paddingY || 'py-8',
        section.properties?.paddingX || 'px-4',
        section.type === 'header' && 'sticky top-0 z-50',
        section.type === 'footer' && 'mt-auto'
      )}
    >
      <div className={cn(
        "container mx-auto",
        isGridLayout && "grid",
        isGridLayout && section.properties?.gridColumns,
        isGridLayout && section.properties?.gridRows && `grid-rows-[${section.properties.gridRows}]`,
        isGridLayout && section.properties?.gridGap
      )}>
        {section.elements.map((element) => (
          <EditableElement
            key={element.id}
            element={element}
            pageId={pageId}
            sectionId={section.id}
            className={cn(
              isGridLayout && element.gridPosition?.column,
              isGridLayout && element.gridPosition?.row,
              isGridLayout && element.gridPosition?.columnSpan,
              isGridLayout && element.gridPosition?.rowSpan,
            )}
          />
        ))}

        {isEditMode && canEdit && (
          <div className={cn(
            "flex justify-center mt-6",
            isGridLayout && "col-span-full"
          )}>
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

      {isEditMode && canEdit && (
        <>
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
              onClick={() => setShowGridSettings(!showGridSettings)}
              className={cn(
                "p-1 hover:bg-gray-100",
                isGridLayout ? "text-editor-blue" : ""
              )}
              title="Grid Settings"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-gray-100 text-red-500"
              title="Delete Section"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {showGridSettings && (
            <div className="absolute top-12 right-2 bg-white shadow-xl rounded-md p-4 z-50 w-64">
              <h4 className="font-medium mb-3">Grid Settings</h4>
              
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="gridLayout"
                  checked={isGridLayout}
                  onChange={toggleGridLayout}
                  className="mr-2"
                />
                <label htmlFor="gridLayout">Enable Grid Layout</label>
              </div>
              
              {isGridLayout && (
                <>
                  <div className="mb-3">
                    <label className="block text-sm mb-1">Columns</label>
                    <select 
                      value={section.properties?.gridColumns || 'grid-cols-1 md:grid-cols-3'} 
                      onChange={handleGridColumnsChange}
                      className="w-full p-1 border rounded text-sm"
                    >
                      <option value="grid-cols-1 md:grid-cols-2">2 Columns</option>
                      <option value="grid-cols-1 md:grid-cols-3">3 Columns</option>
                      <option value="grid-cols-1 md:grid-cols-4">4 Columns</option>
                      <option value="grid-cols-1 md:grid-cols-6">6 Columns</option>
                      <option value="grid-cols-1 md:grid-cols-12">12 Columns</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm mb-1">Gap</label>
                    <select 
                      value={section.properties?.gridGap || 'gap-4'} 
                      onChange={handleGridGapChange}
                      className="w-full p-1 border rounded text-sm"
                    >
                      <option value="gap-0">None</option>
                      <option value="gap-2">Small</option>
                      <option value="gap-4">Medium</option>
                      <option value="gap-6">Large</option>
                      <option value="gap-8">Extra Large</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EditableSection;
