import React, { useState } from 'react';
import { Section } from '@/context/EditorContext';
import { useEditor } from '@/context/EditorContext';
import EditableElement from './EditableElement';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Copy, Trash2, LayoutGrid, MoveVertical } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditableSectionProps {
  section: Section;
  pageId: string;
}

interface GridOption {
  value: string;
  label: string;
  columns: string;
  rows: string;
}

const GRID_OPTIONS: GridOption[] = [
  { value: '1x1', label: '1×1 Grid', columns: 'grid-cols-1', rows: 'grid-rows-1' },
  { value: '1x2', label: '1×2 Grid', columns: 'grid-cols-1', rows: 'grid-rows-2' },
  { value: '1x3', label: '1×3 Grid', columns: 'grid-cols-1', rows: 'grid-rows-3' },
  { value: '1x4', label: '1×4 Grid', columns: 'grid-cols-1', rows: 'grid-rows-4' },
  { value: '2x1', label: '2×1 Grid', columns: 'grid-cols-2', rows: 'grid-rows-1' },
  { value: '2x2', label: '2×2 Grid', columns: 'grid-cols-2', rows: 'grid-rows-2' },
  { value: '2x3', label: '2×3 Grid', columns: 'grid-cols-2', rows: 'grid-rows-3' },
  { value: '2x4', label: '2×4 Grid', columns: 'grid-cols-2', rows: 'grid-rows-4' },
  { value: '3x1', label: '3×1 Grid', columns: 'grid-cols-3', rows: 'grid-rows-1' },
  { value: '3x2', label: '3×2 Grid', columns: 'grid-cols-3', rows: 'grid-rows-2' },
  { value: '3x3', label: '3×3 Grid', columns: 'grid-cols-3', rows: 'grid-rows-3' },
  { value: '4x1', label: '4×1 Grid', columns: 'grid-cols-4', rows: 'grid-rows-1' },
  { value: '4x2', label: '4×2 Grid', columns: 'grid-cols-4', rows: 'grid-rows-2' },
];

const HEIGHT_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'h-screen', label: 'Full Screen' },
  { value: 'h-[500px]', label: '500px' },
  { value: 'h-[600px]', label: '600px' },
  { value: 'h-[700px]', label: '700px' },
  { value: 'h-[800px]', label: '800px' },
  { value: 'min-h-[300px]', label: 'Min 300px' },
  { value: 'min-h-[400px]', label: 'Min 400px' },
  { value: 'min-h-[500px]', label: 'Min 500px' },
  { value: 'min-h-[600px]', label: 'Min 600px' },
];

const EditableSection: React.FC<EditableSectionProps> = ({ section, pageId }) => {
  const { 
    isEditMode, 
    removeSection, 
    duplicateSection, 
    moveSectionUp, 
    moveSectionDown,
    addElement,
    updateSection,
    updateElement,
    userRole
  } = useEditor();
  
  const [showGridSettings, setShowGridSettings] = useState(false);
  const [showSectionSettings, setShowSectionSettings] = useState(false);
  
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

  const handleHeightChange = (value: string) => {
    updateSection(pageId, section.id, {
      properties: {
        ...section.properties,
        height: value
      }
    });
  };

  const handleGridTypeChange = (gridType: string) => {
    const selectedGrid = GRID_OPTIONS.find(option => option.value === gridType);
    
    if (selectedGrid) {
      updateSection(pageId, section.id, {
        properties: {
          ...section.properties,
          isGridLayout: true,
          gridType: gridType,
          gridColumns: selectedGrid.columns,
          gridRows: selectedGrid.rows,
          isDraggableGrid: true
        }
      });
    }
  };

  const toggleGridLayout = () => {
    updateSection(pageId, section.id, {
      properties: {
        ...section.properties,
        isGridLayout: !section.properties?.isGridLayout,
        gridColumns: section.properties?.gridColumns || 'grid-cols-1 md:grid-cols-3',
        gridRows: section.properties?.gridRows || 'auto',
        gridGap: section.properties?.gridGap || 'gap-4',
        isDraggableGrid: section.properties?.isGridLayout ? section.properties?.isDraggableGrid : true
      }
    });
  };

  const toggleDraggableGrid = () => {
    updateSection(pageId, section.id, {
      properties: {
        ...section.properties,
        isDraggableGrid: !section.properties?.isDraggableGrid
      }
    });
  };

  const handleGridGapChange = (value: number[]) => {
    const gapSize = value[0];
    let gapClass = 'gap-4';
    
    if (gapSize <= 0) gapClass = 'gap-0';
    else if (gapSize <= 2) gapClass = 'gap-1';
    else if (gapSize <= 4) gapClass = 'gap-2';
    else if (gapSize <= 6) gapClass = 'gap-3';
    else if (gapSize <= 8) gapClass = 'gap-4';
    else if (gapSize <= 10) gapClass = 'gap-5';
    else if (gapSize <= 12) gapClass = 'gap-6';
    else if (gapSize <= 14) gapClass = 'gap-8';
    else gapClass = 'gap-10';
    
    updateSection(pageId, section.id, {
      properties: {
        ...section.properties,
        gridGap: gapClass
      }
    });
  };

  const getCurrentGapValue = () => {
    const gapClass = section.properties?.gridGap || 'gap-4';
    const gapValue = parseInt(gapClass.replace('gap-', '')) || 4;
    
    switch (gapValue) {
      case 0: return 0;
      case 1: return 2;
      case 2: return 4;
      case 3: return 6;
      case 4: return 8;
      case 5: return 10;
      case 6: return 12;
      case 8: return 14;
      case 10: return 16;
      default: return 8;
    }
  };

  const isGridLayout = section.properties?.isGridLayout;
  const isDraggableGrid = section.properties?.isDraggableGrid;
  const currentHeight = section.properties?.height || 'auto';
  const currentGridType = section.properties?.gridType || '1x1';

  const handleElementDragStart = (elementId: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData('elementId', elementId);
  };

  const handleGridDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isGridLayout || !isDraggableGrid) return;
    
    const elementId = e.dataTransfer.getData('elementId');
    if (!elementId) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const gridColumns = parseInt(section.properties?.gridColumns?.replace(/\D/g, '') || '1');
    const gridRows = parseInt(section.properties?.gridRows?.replace(/\D/g, '') || '1');
    
    const colWidth = rect.width / gridColumns;
    const rowHeight = rect.height / gridRows;
    
    const col = Math.min(Math.floor(x / colWidth) + 1, gridColumns);
    const row = Math.min(Math.floor(y / rowHeight) + 1, gridRows);
    
    const element = section.elements.find(el => el.id === elementId);
    if (element) {
      updateElement(pageId, section.id, elementId, {
        gridPosition: {
          ...element.gridPosition,
          column: `col-span-1 md:col-start-${col}`,
          row: `row-start-${row}`
        }
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isGridLayout && isDraggableGrid) {
      e.preventDefault();
    }
  };

  return (
    <div
      className={cn(
        'relative',
        section.properties?.backgroundColor || 'bg-white',
        section.properties?.paddingY || 'py-8',
        section.properties?.paddingX || 'px-4',
        section.properties?.height || 'auto',
        section.type === 'header' && 'sticky top-0 z-50',
        section.type === 'footer' && 'mt-auto'
      )}
    >
      <div 
        className={cn(
          "container mx-auto",
          isGridLayout && "grid",
          isGridLayout && section.properties?.gridColumns,
          isGridLayout && section.properties?.gridRows && `grid-rows-[${section.properties.gridRows}]`,
          isGridLayout && section.properties?.gridGap,
          isGridLayout && isDraggableGrid && "relative"
        )}
        onDrop={handleGridDrop}
        onDragOver={handleDragOver}
      >
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
              isGridLayout && isDraggableGrid && "cursor-move"
            )}
            draggable={isGridLayout && isDraggableGrid}
            onDragStart={handleElementDragStart(element.id)}
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
              onClick={() => setShowSectionSettings(!showSectionSettings)}
              className={cn(
                "p-1 hover:bg-gray-100",
                showSectionSettings ? "text-editor-blue" : ""
              )}
              title="Section Height"
            >
              <MoveVertical size={16} />
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

          {showSectionSettings && (
            <div className="absolute top-12 right-2 bg-white shadow-xl rounded-md p-4 z-50 w-64">
              <h4 className="font-medium mb-3">Section Height</h4>
              
              <Select
                value={currentHeight}
                onValueChange={handleHeightChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select height" />
                </SelectTrigger>
                <SelectContent>
                  {HEIGHT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      id="draggableGrid"
                      checked={!!isDraggableGrid}
                      onChange={toggleDraggableGrid}
                      className="mr-2"
                    />
                    <label htmlFor="draggableGrid">Draggable Elements</label>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm mb-1">Grid Type</label>
                    <Select
                      value={currentGridType}
                      onValueChange={handleGridTypeChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select grid" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRID_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm mb-1">Gap Size</label>
                    <Slider
                      defaultValue={[getCurrentGapValue()]}
                      max={16}
                      step={2}
                      onValueChange={handleGridGapChange}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>None</span>
                      <span>Small</span>
                      <span>Large</span>
                    </div>
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
