
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import PageRenderer from '@/components/PageRenderer';
import EditorSidebar from '@/components/EditorSidebar';
import { useEditor } from '@/context/EditorContext';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { isEditMode, saveEditorChanges } = useEditor();
  const { toast } = useToast();

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
