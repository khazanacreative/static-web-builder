
import React from 'react';
import { useEditor } from '@/context/EditorContext';
import EditableSection from './EditableSection';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PageRenderer: React.FC = () => {
  const { pages, currentPageId, updatePage, isEditMode, userRole, removePage } = useEditor();
  const { toast } = useToast();
  
  const currentPage = pages.find(page => page.id === currentPageId);
  const canEdit = userRole === 'admin' || userRole === 'editor';
  const isAdmin = userRole === 'admin';
  
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
  
  const handlePageSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePage(currentPageId, { slug: e.target.value });
  };
  
  const handleDeletePage = () => {
    if (pages.length <= 1) {
      toast({
        title: "Cannot Delete Page",
        description: "You must have at least one page in your site.",
        variant: "destructive",
      });
      return;
    }
    
    // Find another page to navigate to
    const otherPage = pages.find(page => page.id !== currentPageId);
    if (otherPage) {
      removePage(currentPageId, otherPage.id);
      toast({
        title: "Page Deleted",
        description: `The page "${currentPage.title}" has been deleted.`,
        variant: "default",
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {isEditMode && canEdit && (
        <div className="bg-gray-100 p-2 border-b border-gray-200">
          <div className="container mx-auto flex items-center flex-wrap gap-2">
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">Page Title:</span>
              <input
                type="text"
                value={currentPage.title}
                onChange={handlePageTitleChange}
                className="px-2 py-1 text-sm border rounded"
              />
            </div>
            
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">Slug:</span>
              <input
                type="text"
                value={currentPage.slug}
                onChange={handlePageSlugChange}
                className="px-2 py-1 text-sm border rounded"
              />
            </div>
            
            {isAdmin && (
              <button
                onClick={handleDeletePage}
                className="ml-auto flex items-center px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm"
                title="Delete this page"
              >
                <Trash2 size={14} className="mr-1" />
                Delete Page
              </button>
            )}
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
