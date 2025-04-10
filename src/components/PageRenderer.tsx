
import React from 'react';
import { useEditor } from '@/context/EditorContext';
import EditableSection from './EditableSection';

const PageRenderer: React.FC = () => {
  const { pages, currentPageId, updatePage, isEditMode, userRole } = useEditor();
  
  const currentPage = pages.find(page => page.id === currentPageId);
  const canEdit = userRole === 'admin' || userRole === 'editor';
  
  if (!currentPage) {
    return <div className="p-8 text-center text-red-500">Page not found</div>;
  }

  // Separate sections by type
  const headerSection = currentPage.sections.find(section => section.type === 'header');
  const footerSection = currentPage.sections.find(section => section.type === 'footer');
  const contentSections = currentPage.sections.filter(
    section => section.type === 'content' || !section.type
  );
  
  const handlePageTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePage(currentPageId, { title: e.target.value });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {isEditMode && canEdit && (
        <div className="bg-gray-100 p-2 border-b border-gray-200">
          <div className="container mx-auto flex items-center">
            <span className="text-sm font-medium mr-2">Page Title:</span>
            <input
              type="text"
              value={currentPage.title}
              onChange={handlePageTitleChange}
              className="px-2 py-1 text-sm border rounded"
            />
            <span className="text-xs ml-4 text-gray-500">{currentPage.slug}</span>
          </div>
        </div>
      )}
      
      {/* Render Header */}
      {headerSection && (
        <EditableSection 
          key={headerSection.id}
          section={headerSection}
          pageId={currentPage.id}
        />
      )}
      
      {/* Render Content */}
      <div className="flex-grow">
        {contentSections.map((section) => (
          <EditableSection 
            key={section.id}
            section={section}
            pageId={currentPage.id}
          />
        ))}
      </div>
      
      {/* Render Footer */}
      {footerSection && (
        <EditableSection 
          key={footerSection.id}
          section={footerSection}
          pageId={currentPage.id}
        />
      )}
    </div>
  );
};

export default PageRenderer;
