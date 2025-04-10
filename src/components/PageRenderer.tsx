
import React from 'react';
import { useEditor } from '@/context/EditorContext';
import EditableSection from './EditableSection';

const PageRenderer: React.FC = () => {
  const { pages, currentPageId } = useEditor();
  
  const currentPage = pages.find(page => page.id === currentPageId);
  
  if (!currentPage) {
    return <div className="p-8 text-center text-red-500">Page not found</div>;
  }
  
  return (
    <div className="min-h-screen">
      {currentPage.sections.map((section) => (
        <EditableSection 
          key={section.id}
          section={section}
          pageId={currentPage.id}
        />
      ))}
    </div>
  );
};

export default PageRenderer;
