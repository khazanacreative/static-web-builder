import React, { useState } from 'react';
import { useEditor } from '@/context/EditorContext';
import { Plus, Settings, Layers, FileText, LayoutGrid, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TextStyleEditor } from './TextStyleEditor';

const EditorSidebar: React.FC = () => {
  const { 
    isEditMode, 
    pages, 
    currentPageId, 
    userRole,
    addPage, 
    setCurrentPageId,
    addSection,
    getSelectedElement,
    updateElement,
    replaceHeaderSection,
    replaceFooterSection
  } = useEditor();
  
  const [activeTab, setActiveTab] = useState<'pages' | 'elements'>('pages');
  const selectedElementData = getSelectedElement();
  const canEdit = userRole === 'admin' || userRole === 'editor';
  const isAdmin = userRole === 'admin';

  if (!isEditMode || !canEdit) return null;

  const handleAddPage = () => {
    const newPageId = `page-${Date.now()}`;
    const newPageTitle = `New Page ${pages.length + 1}`;
    const newPageSlug = `/${newPageTitle.toLowerCase().replace(/\s+/g, '-')}`;
    
    addPage({
      id: newPageId,
      title: newPageTitle,
      slug: newPageSlug,
      isPublished: false,
      sections: [
        {
          id: `section-${Date.now()}`,
          type: 'content',
          properties: {
            backgroundColor: 'bg-white',
            paddingY: 'py-12',
            paddingX: 'px-4'
          },
          elements: [
            {
              id: `element-${Date.now()}-heading`,
              type: 'heading',
              content: newPageTitle,
              properties: {
                className: 'text-3xl font-bold text-center mb-8'
              }
            },
            {
              id: `element-${Date.now()}-text`,
              type: 'text',
              content: 'This is a new page. Start editing to add your content.',
              properties: {
                className: 'text-center max-w-2xl mx-auto'
              }
            }
          ]
        }
      ]
    });
  };

  const handleAddSection = () => {
    const currentPage = pages.find(page => page.id === currentPageId);
    if (!currentPage) return;
    
    addSection(currentPageId, {
      id: `section-${Date.now()}`,
      type: 'content',
      properties: {
        backgroundColor: 'bg-white',
        paddingY: 'py-12',
        paddingX: 'px-4'
      },
      elements: [
        {
          id: `element-${Date.now()}-heading`,
          type: 'heading',
          content: 'New Section',
          properties: {
            className: 'text-2xl font-bold text-center mb-4'
          }
        },
        {
          id: `element-${Date.now()}-text`,
          type: 'text',
          content: 'This is a new section. Add elements and customize as needed.',
          properties: {
            className: 'text-center max-w-2xl mx-auto'
          }
        }
      ]
    });
  };

  const handleAddHeaderSection = () => {
    if (!isAdmin) return;
    
    replaceHeaderSection(currentPageId, {
      id: `header-section-${Date.now()}`,
      properties: {
        backgroundColor: 'bg-white',
        paddingY: 'py-4',
        paddingX: 'px-4'
      },
      elements: [
        {
          id: `header-logo-${Date.now()}`,
          type: 'image',
          content: '/placeholder.svg',
          properties: {
            className: 'h-10 w-auto'
          }
        },
        {
          id: `header-title-${Date.now()}`,
          type: 'heading',
          content: 'My Website',
          properties: {
            className: 'text-xl font-bold'
          }
        }
      ]
    });
  };

  const handleAddFooterSection = () => {
    if (!isAdmin) return;
    
    replaceFooterSection(currentPageId, {
      id: `footer-section-${Date.now()}`,
      properties: {
        backgroundColor: 'bg-gray-800',
        paddingY: 'py-8',
        paddingX: 'px-4'
      },
      elements: [
        {
          id: `footer-text-${Date.now()}`,
          type: 'text',
          content: '© 2025 Website Builder. All rights reserved.',
          properties: {
            className: 'text-gray-400 text-center'
          }
        }
      ]
    });
  };
  
  const updateElementColor = (color: string) => {
    if (!selectedElementData) return;
    
    const { pageId, sectionId, element } = selectedElementData;
    const currentClassName = element.properties?.className || '';
    
    const cleanedClassName = currentClassName.replace(/text-\w+-\d+|text-\w+/g, '').trim();
    
    const newClassName = `${cleanedClassName} ${color}`;
    
    updateElement(pageId, sectionId, element.id, {
      properties: {
        ...element.properties,
        className: newClassName
      }
    });
  };

  const updateElementAlign = (align: string) => {
    if (!selectedElementData) return;
    
    const { pageId, sectionId, element } = selectedElementData;
    const currentClassName = element.properties?.className || '';
    
    const cleanedClassName = currentClassName.replace(/text-left|text-center|text-right/g, '').trim();
    
    const newClassName = `${cleanedClassName} ${align}`;
    
    updateElement(pageId, sectionId, element.id, {
      properties: {
        ...element.properties,
        className: newClassName
      }
    });
  };

  const updateElementGridPosition = (property: string, value: string) => {
    if (!selectedElementData) return;
    
    const { pageId, sectionId, element } = selectedElementData;
    
    updateElement(pageId, sectionId, element.id, {
      gridPosition: {
        ...element.gridPosition || {
          column: '',
          row: '',
          columnSpan: '',
          rowSpan: ''
        },
        [property]: value
      }
    });
  };

  const currentPage = pages.find(page => page.id === currentPageId);
  let currentSectionUsesGrid = false;
  
  if (selectedElementData && currentPage) {
    const section = currentPage.sections.find(s => s.id === selectedElementData.sectionId);
    currentSectionUsesGrid = section?.properties?.isGridLayout || false;
  }

  const isTextElement = selectedElementData && ['heading', 'text', 'button'].includes(selectedElementData.element.type);

  return (
    <div className="bg-white border-l shadow-lg fixed right-0 top-0 h-full w-72 z-10 overflow-auto">
      <div className="p-4 border-b">
        <h2 className="font-medium text-xl">Page Editor</h2>
      </div>
      
      <div className="flex border-b">
        <button 
          className={cn(
            "flex-1 p-3 text-sm font-medium",
            activeTab === 'pages' ? 'bg-gray-100 border-b-2 border-editor-blue' : ''
          )}
          onClick={() => setActiveTab('pages')}
        >
          <FileText size={16} className="inline mr-2" />
          Pages & Sections
        </button>
        <button 
          className={cn(
            "flex-1 p-3 text-sm font-medium",
            activeTab === 'elements' ? 'bg-gray-100 border-b-2 border-editor-blue' : ''
          )}
          onClick={() => setActiveTab('elements')}
        >
          <Settings size={16} className="inline mr-2" />
          Element Settings
        </button>
      </div>
      
      {activeTab === 'pages' && (
        <div className="p-4">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Pages</h3>
              <button 
                onClick={handleAddPage}
                className="text-xs bg-editor-blue text-white px-2 py-1 rounded flex items-center"
                disabled={!isAdmin}
                title={!isAdmin ? "Only admins can add pages" : "Add a new page"}
              >
                <Plus size={12} className="mr-1" />
                Add Page
              </button>
            </div>
            <div className="bg-gray-50 rounded p-2 max-h-40 overflow-y-auto">
              {pages.map(page => (
                <div 
                  key={page.id} 
                  className={cn(
                    "p-2 rounded mb-1 text-sm cursor-pointer",
                    currentPageId === page.id ? "bg-editor-blue text-white" : "bg-white hover:bg-gray-100",
                    !page.isPublished && "border-l-4 border-amber-300"
                  )}
                  onClick={() => setCurrentPageId(page.id)}
                >
                  {page.title}
                  {!page.isPublished && (
                    <span className="ml-2 text-xs opacity-70">(Draft)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Sections</h3>
              <button 
                onClick={handleAddSection}
                className="text-xs bg-editor-blue text-white px-2 py-1 rounded flex items-center"
              >
                <Plus size={12} className="mr-1" />
                Add Section
              </button>
            </div>
            
            {isAdmin && (
              <div className="mt-2 mb-4 flex space-x-2">
                <button 
                  onClick={handleAddHeaderSection}
                  className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded flex-1"
                >
                  Replace Header
                </button>
                <button 
                  onClick={handleAddFooterSection}
                  className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded flex-1"
                >
                  Replace Footer
                </button>
              </div>
            )}
            
            <div className="text-sm text-gray-600 italic">
              Use the section controls to manage layout
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'elements' && (
        <div className="p-4">
          {selectedElementData ? (
            <div>
              <h3 className="font-medium mb-4">Element Settings: {selectedElementData.element.type}</h3>
              
              {isTextElement && (
                <div className="mb-6 border-b pb-4">
                  <div className="flex items-center mb-2">
                    <Type size={16} className="mr-2" />
                    <h4 className="font-medium">Text Styling</h4>
                  </div>
                  <TextStyleEditor 
                    element={selectedElementData.element}
                    pageId={selectedElementData.pageId}
                    sectionId={selectedElementData.sectionId}
                  />
                </div>
              )}
              
              {(['heading', 'text', 'button'].includes(selectedElementData.element.type)) && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Text Color</label>
                  <div className="grid grid-cols-5 gap-2">
                    <button onClick={() => updateElementColor('text-black')} className="w-6 h-6 bg-black rounded-full" />
                    <button onClick={() => updateElementColor('text-white')} className="w-6 h-6 bg-white border rounded-full" />
                    <button onClick={() => updateElementColor('text-editor-blue')} className="w-6 h-6 bg-editor-blue rounded-full" />
                    <button onClick={() => updateElementColor('text-editor-purple')} className="w-6 h-6 bg-editor-purple rounded-full" />
                    <button onClick={() => updateElementColor('text-editor-teal')} className="w-6 h-6 bg-editor-teal rounded-full" />
                    <button onClick={() => updateElementColor('text-gray-700')} className="w-6 h-6 bg-gray-700 rounded-full" />
                    <button onClick={() => updateElementColor('text-red-500')} className="w-6 h-6 bg-red-500 rounded-full" />
                    <button onClick={() => updateElementColor('text-yellow-500')} className="w-6 h-6 bg-yellow-500 rounded-full" />
                    <button onClick={() => updateElementColor('text-green-500')} className="w-6 h-6 bg-green-500 rounded-full" />
                    <button onClick={() => updateElementColor('text-editor-indigo')} className="w-6 h-6 bg-editor-indigo rounded-full" />
                  </div>
                </div>
              )}
              
              {currentSectionUsesGrid && (
                <div className="mb-4 border-t pt-4">
                  <div className="flex items-center mb-2">
                    <LayoutGrid size={16} className="mr-2" />
                    <label className="block text-sm font-medium">Grid Position</label>
                  </div>
                  
                  <div className="mb-2">
                    <label className="block text-xs text-gray-500 mb-1">Column</label>
                    <select 
                      value={selectedElementData.element.gridPosition?.column || ''}
                      onChange={(e) => updateElementGridPosition('column', e.target.value)}
                      className="w-full p-1 text-sm border rounded"
                    >
                      <option value="">Default</option>
                      <option value="col-span-1">Column 1</option>
                      <option value="col-span-1 md:col-start-1">Start at 1</option>
                      <option value="col-span-1 md:col-start-2">Start at 2</option>
                      <option value="col-span-1 md:col-start-3">Start at 3</option>
                      <option value="col-span-full">Full Width</option>
                    </select>
                  </div>
                  
                  <div className="mb-2">
                    <label className="block text-xs text-gray-500 mb-1">Row</label>
                    <select 
                      value={selectedElementData.element.gridPosition?.row || ''}
                      onChange={(e) => updateElementGridPosition('row', e.target.value)}
                      className="w-full p-1 text-sm border rounded"
                    >
                      <option value="">Default</option>
                      <option value="row-start-1">Row 1</option>
                      <option value="row-start-2">Row 2</option>
                      <option value="row-start-3">Row 3</option>
                      <option value="row-start-4">Row 4</option>
                    </select>
                  </div>
                  
                  <div className="mb-2">
                    <label className="block text-xs text-gray-500 mb-1">Column Span</label>
                    <select 
                      value={selectedElementData.element.gridPosition?.columnSpan || ''}
                      onChange={(e) => updateElementGridPosition('columnSpan', e.target.value)}
                      className="w-full p-1 text-sm border rounded"
                    >
                      <option value="">Default</option>
                      <option value="md:col-span-1">Span 1</option>
                      <option value="md:col-span-2">Span 2</option>
                      <option value="md:col-span-3">Span 3</option>
                      <option value="col-span-full">Full Width</option>
                    </select>
                  </div>
                  
                  <div className="mb-2">
                    <label className="block text-xs text-gray-500 mb-1">Row Span</label>
                    <select 
                      value={selectedElementData.element.gridPosition?.rowSpan || ''}
                      onChange={(e) => updateElementGridPosition('rowSpan', e.target.value)}
                      className="w-full p-1 text-sm border rounded"
                    >
                      <option value="">Default</option>
                      <option value="row-span-1">Span 1</option>
                      <option value="row-span-2">Span 2</option>
                      <option value="row-span-3">Span 3</option>
                    </select>
                  </div>
                </div>
              )}
              
              <div className="text-sm text-gray-600">
                Double-click on text elements to edit their content.
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Layers size={24} className="mx-auto mb-2" />
              <p>Select an element to edit its properties</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EditorSidebar;
