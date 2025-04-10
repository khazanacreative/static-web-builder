
import React from 'react';
import { useEditor } from '@/context/EditorContext';
import { Edit, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  const { isEditMode, toggleEditMode, pages, currentPageId, setCurrentPageId } = useEditor();

  return (
    <nav className="flex items-center justify-between bg-white shadow-sm px-4 py-2">
      <div className="flex items-center space-x-6">
        <div className="font-bold text-xl text-editor-blue">PageWeaver</div>
        
        <div className="hidden md:flex space-x-4">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => setCurrentPageId(page.id)}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium',
                currentPageId === page.id
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              {page.title}
            </button>
          ))}
        </div>
      </div>
      
      <button
        onClick={toggleEditMode}
        className={cn(
          'flex items-center px-3 py-1.5 rounded-md text-sm font-medium',
          isEditMode
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-editor-blue text-white hover:bg-blue-600'
        )}
      >
        {isEditMode ? (
          <>
            <Save size={16} className="mr-1" />
            Save Page
          </>
        ) : (
          <>
            <Edit size={16} className="mr-1" />
            Edit Page
          </>
        )}
      </button>
    </nav>
  );
};

export default Navbar;
