
import React, { useState } from 'react';
import { useEditor } from '@/context/EditorContext';
import { Plus, Settings, Layers, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const EditorSidebar: React.FC = () => {
  const { 
    isEditMode, 
    pages, 
    currentPageId, 
    addPage, 
    setCurrentPageId,
    addSection,
    getSelectedElement,
    updateElement
  } = useEditor();
  
  const [activeTab, setActiveTab] = useState<'pages' | 'elements'>('pages');
  const selectedElementData = getSelectedElement();

  if (!isEditMode) return null;

  const handleAddPage = () => {
    const newPageId = `page-${Date.now()}`;
    const newPageTitle = `New Page ${pages.length + 1}`;
    const newPageSlug = `/${newPageTitle.toLowerCase().replace(/\s+/g, '-')}`;
    
    addPage({
      id: newPageId,
      title: newPageTitle,
      slug: newPageSlug,
      sections: [
        {
          id: `section-${Date.now()}`,
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
  
  const updateElementColor = (color: string) => {
    if (!selectedElementData) return;
    
    const { pageId, sectionId, element } = selectedElementData;
    const currentClassName = element.properties?.className || '';
    
    // Remove any existing text color classes
    const cleanedClassName = currentClassName.replace(/text-\w+-\d+|text-\w+/g, '').trim();
    
    // Add new color class
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
    
    // Remove any existing text alignment classes
    const cleanedClassName = currentClassName.replace(/text-left|text-center|text-right/g, '').trim();
    
    // Add new alignment class
    const newClassName = `${cleanedClassName} ${align}`;
    
    updateElement(pageId, sectionId, element.id, {
      properties: {
        ...element.properties,
        className: newClassName
      }
    });
  };

  return (
    <div className="bg-white border-l shadow-lg fixed right-0 top-0 h-full w-72 z-10">
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
                    currentPageId === page.id ? "bg-editor-blue text-white" : "bg-white hover:bg-gray-100"
                  )}
                  onClick={() => setCurrentPageId(page.id)}
                >
                  {page.title}
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
              
              {(['heading', 'text', 'button'].includes(selectedElementData.element.type)) && (
                <>
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
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Alignment</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => updateElementAlign('text-left')} 
                        className="bg-gray-100 hover:bg-gray-200 py-1 rounded text-sm"
                      >
                        Left
                      </button>
                      <button 
                        onClick={() => updateElementAlign('text-center')} 
                        className="bg-gray-100 hover:bg-gray-200 py-1 rounded text-sm"
                      >
                        Center
                      </button>
                      <button 
                        onClick={() => updateElementAlign('text-right')} 
                        className="bg-gray-100 hover:bg-gray-200 py-1 rounded text-sm"
                      >
                        Right
                      </button>
                    </div>
                  </div>
                </>
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
