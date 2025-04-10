
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import PageRenderer from '@/components/PageRenderer';
import EditorSidebar from '@/components/EditorSidebar';
import { useEditor } from '@/context/EditorContext';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { isEditMode, saveEditorChanges } = useEditor();
  const { toast } = useToast();

  // Auto-save when exiting edit mode
  useEffect(() => {
    let saveTimeout: NodeJS.Timeout | null = null;
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditMode) {
        e.preventDefault();
        e.returnValue = 'Perubahan belum disimpan. Yakin ingin meninggalkan halaman?';
        return e.returnValue;
      }
    };

    // Add event listener for beforeunload
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, [isEditMode]);

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
