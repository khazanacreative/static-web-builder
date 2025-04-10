
import React from 'react';
import { useEditor } from '@/context/EditorContext';
import EditableSection from './EditableSection';

const PageRenderer: React.FC = () => {
  const { pages, currentPageId } = useEditor();
  
  const currentPage = pages.find(page => page.id === currentPageId);
  
  if (!currentPage) {
    return <div className="p-8 text-center text-red-500">Page not found</div>;
  }

  // Separate sections by type
  const headerSection = currentPage.sections.find(section => section.type === 'header');
  const footerSection = currentPage.sections.find(section => section.type === 'footer');
  const contentSections = currentPage.sections.filter(
    section => section.type === 'content' || !section.type
  );
  
  return (
    <div className="min-h-screen flex flex-col">
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
