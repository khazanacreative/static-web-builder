
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import PageRenderer from '@/components/PageRenderer';
import EditorSidebar from '@/components/EditorSidebar';
import { useEditor } from '@/context/EditorContext';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';

const Index = () => {
  const { isEditMode, saveEditorChanges, pages, setCurrentPageId, currentPageId } = useEditor();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Set current page based on URL path (slug)
  useEffect(() => {
    const currentPath = location.pathname;
    let matchingPage = pages.find(page => page.slug === currentPath);
    
    if (matchingPage) {
      setCurrentPageId(matchingPage.id);
    } else if (currentPath !== '/' && pages.length > 0) {
      // If no matching page is found and we're not on home page,
      // try to find a page with the closest matching slug
      const potentialMatch = pages.find(page => 
        currentPath.startsWith(page.slug) && page.slug !== '/'
      );
      
      if (potentialMatch) {
        setCurrentPageId(potentialMatch.id);
      } else {
        // If no matching page found and not on home, default to home page
        const homePage = pages.find(page => page.slug === '/');
        if (homePage && currentPageId !== homePage.id) {
          navigate('/');
        }
      }
    }
  }, [location.pathname, pages, setCurrentPageId]);

  // Update URL when current page changes
  useEffect(() => {
    if (currentPageId) {
      const currentPage = pages.find(page => page.id === currentPageId);
      if (currentPage && location.pathname !== currentPage.slug) {
        navigate(currentPage.slug);
      }
    }
  }, [currentPageId, pages, navigate, location.pathname]);

  // Auto-save when exiting edit mode and warn before unload
  useEffect(() => {
    let saveTimeout: NodeJS.Timeout | null = null;
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditMode) {
        e.preventDefault();
        e.returnValue = 'Perubahan belum disimpan. Yakin ingin meninggalkan halaman?';
        return e.returnValue;
      }
    };

    // Auto-save functionality when exiting edit mode
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isEditMode) {
        saveEditorChanges().then(() => {
          console.log('Auto-saved changes due to page visibility change');
        }).catch(error => {
          console.error('Failed to auto-save changes:', error);
        });
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, [isEditMode, saveEditorChanges]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className={isEditMode ? 'mr-72' : ''}>
        <PageRenderer />
      </main>
      <EditorSidebar />
    </div>
  );
};

export default Index;
