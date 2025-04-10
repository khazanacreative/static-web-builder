
import React, { createContext, useState, useContext, ReactNode } from 'react';

export type ElementType = 'heading' | 'text' | 'image' | 'button' | 'section';

export interface PageElement {
  id: string;
  type: ElementType;
  content: string;
  properties?: Record<string, any>;
}

export interface Section {
  id: string;
  elements: PageElement[];
  properties?: {
    backgroundColor?: string;
    paddingY?: string;
    paddingX?: string;
  };
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  sections: Section[];
}

interface EditorContextType {
  pages: Page[];
  currentPageId: string;
  isEditMode: boolean;
  selectedElementId: string | null;
  addPage: (page: Page) => void;
  setCurrentPageId: (id: string) => void;
  updatePage: (pageId: string, updatedPage: Partial<Page>) => void;
  toggleEditMode: () => void;
  addSection: (pageId: string, section: Section) => void;
  updateSection: (pageId: string, sectionId: string, section: Partial<Section>) => void;
  removeSection: (pageId: string, sectionId: string) => void;
  addElement: (pageId: string, sectionId: string, element: PageElement) => void;
  updateElement: (pageId: string, sectionId: string, elementId: string, element: Partial<PageElement>) => void;
  removeElement: (pageId: string, sectionId: string, elementId: string) => void;
  selectElement: (elementId: string | null) => void;
  duplicateSection: (pageId: string, sectionId: string) => void;
  moveSectionUp: (pageId: string, sectionId: string) => void;
  moveSectionDown: (pageId: string, sectionId: string) => void;
  getSelectedElement: () => { pageId: string, sectionId: string, element: PageElement } | null;
}

export const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pages, setPages] = useState<Page[]>([defaultHomePage]);
  const [currentPageId, setCurrentPageId] = useState(defaultHomePage.id);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const addPage = (page: Page) => {
    setPages((prevPages) => [...prevPages, page]);
  };

  const updatePage = (pageId: string, updatedPage: Partial<Page>) => {
    setPages((prevPages) =>
      prevPages.map((page) =>
        page.id === pageId ? { ...page, ...updatedPage } : page
      )
    );
  };

  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev);
    if (isEditMode) {
      setSelectedElementId(null);
    }
  };

  const addSection = (pageId: string, section: Section) => {
    setPages((prevPages) =>
      prevPages.map((page) =>
        page.id === pageId
          ? { ...page, sections: [...page.sections, section] }
          : page
      )
    );
  };

  const updateSection = (pageId: string, sectionId: string, updatedSection: Partial<Section>) => {
    setPages((prevPages) =>
      prevPages.map((page) =>
        page.id === pageId
          ? {
              ...page,
              sections: page.sections.map((section) =>
                section.id === sectionId
                  ? { ...section, ...updatedSection }
                  : section
              ),
            }
          : page
      )
    );
  };

  const removeSection = (pageId: string, sectionId: string) => {
    setPages((prevPages) =>
      prevPages.map((page) =>
        page.id === pageId
          ? {
              ...page,
              sections: page.sections.filter(
                (section) => section.id !== sectionId
              ),
            }
          : page
      )
    );
  };

  const addElement = (pageId: string, sectionId: string, element: PageElement) => {
    setPages((prevPages) =>
      prevPages.map((page) =>
        page.id === pageId
          ? {
              ...page,
              sections: page.sections.map((section) =>
                section.id === sectionId
                  ? {
                      ...section,
                      elements: [...section.elements, element],
                    }
                  : section
              ),
            }
          : page
      )
    );
  };

  const updateElement = (
    pageId: string,
    sectionId: string,
    elementId: string,
    updatedElement: Partial<PageElement>
  ) => {
    setPages((prevPages) =>
      prevPages.map((page) =>
        page.id === pageId
          ? {
              ...page,
              sections: page.sections.map((section) =>
                section.id === sectionId
                  ? {
                      ...section,
                      elements: section.elements.map((element) =>
                        element.id === elementId
                          ? { ...element, ...updatedElement }
                          : element
                      ),
                    }
                  : section
              ),
            }
          : page
      )
    );
  };

  const removeElement = (pageId: string, sectionId: string, elementId: string) => {
    setPages((prevPages) =>
      prevPages.map((page) =>
        page.id === pageId
          ? {
              ...page,
              sections: page.sections.map((section) =>
                section.id === sectionId
                  ? {
                      ...section,
                      elements: section.elements.filter(
                        (element) => element.id !== elementId
                      ),
                    }
                  : section
              ),
            }
          : page
      )
    );
  };

  const selectElement = (elementId: string | null) => {
    setSelectedElementId(elementId);
  };

  const getSelectedElement = () => {
    if (!selectedElementId) return null;

    for (const page of pages) {
      if (page.id === currentPageId) {
        for (const section of page.sections) {
          const element = section.elements.find(e => e.id === selectedElementId);
          if (element) {
            return { pageId: page.id, sectionId: section.id, element };
          }
        }
      }
    }
    
    return null;
  };

  const duplicateSection = (pageId: string, sectionId: string) => {
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id === pageId) {
          const sectionToDuplicate = page.sections.find(
            (section) => section.id === sectionId
          );

          if (sectionToDuplicate) {
            const sectionIndex = page.sections.findIndex(
              (section) => section.id === sectionId
            );

            const duplicatedSection: Section = {
              ...sectionToDuplicate,
              id: `section-${Date.now()}`,
              elements: sectionToDuplicate.elements.map(element => ({
                ...element,
                id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
              }))
            };

            const newSections = [...page.sections];
            newSections.splice(sectionIndex + 1, 0, duplicatedSection);

            return {
              ...page,
              sections: newSections
            };
          }
        }
        return page;
      })
    );
  };

  const moveSectionUp = (pageId: string, sectionId: string) => {
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id === pageId) {
          const sectionIndex = page.sections.findIndex(
            (section) => section.id === sectionId
          );

          if (sectionIndex > 0) {
            const newSections = [...page.sections];
            const temp = newSections[sectionIndex - 1];
            newSections[sectionIndex - 1] = newSections[sectionIndex];
            newSections[sectionIndex] = temp;

            return {
              ...page,
              sections: newSections
            };
          }
        }
        return page;
      })
    );
  };

  const moveSectionDown = (pageId: string, sectionId: string) => {
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id === pageId) {
          const sectionIndex = page.sections.findIndex(
            (section) => section.id === sectionId
          );

          if (sectionIndex < page.sections.length - 1) {
            const newSections = [...page.sections];
            const temp = newSections[sectionIndex + 1];
            newSections[sectionIndex + 1] = newSections[sectionIndex];
            newSections[sectionIndex] = temp;

            return {
              ...page,
              sections: newSections
            };
          }
        }
        return page;
      })
    );
  };

  const value = {
    pages,
    currentPageId,
    isEditMode,
    selectedElementId,
    addPage,
    setCurrentPageId,
    updatePage,
    toggleEditMode,
    addSection,
    updateSection,
    removeSection,
    addElement,
    updateElement,
    removeElement,
    selectElement,
    duplicateSection,
    moveSectionUp,
    moveSectionDown,
    getSelectedElement
  };

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};

// Default homepage data
const defaultHomePage: Page = {
  id: 'home-page',
  title: 'Home',
  slug: '/',
  sections: [
    {
      id: 'hero-section',
      properties: {
        backgroundColor: 'bg-gradient-to-r from-editor-blue to-editor-purple',
        paddingY: 'py-20',
        paddingX: 'px-4'
      },
      elements: [
        {
          id: 'hero-heading',
          type: 'heading',
          content: 'Buat Website Impian Anda dengan Editor Visual',
          properties: {
            className: 'text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-6'
          }
        },
        {
          id: 'hero-text',
          type: 'text',
          content: 'Edit konten, gambar, dan tata letak website Anda tanpa perlu keahlian coding. Solusi website builder yang kuat dan simpel.',
          properties: {
            className: 'text-lg md:text-xl text-white text-center max-w-3xl mx-auto mb-8'
          }
        },
        {
          id: 'hero-button',
          type: 'button',
          content: 'Coba Sekarang',
          properties: {
            className: 'bg-white text-editor-blue hover:bg-gray-100 px-6 py-3 rounded-lg font-medium text-lg mx-auto block'
          }
        }
      ],
    },
    {
      id: 'features-section',
      properties: {
        backgroundColor: 'bg-white',
        paddingY: 'py-16',
        paddingX: 'px-4'
      },
      elements: [
        {
          id: 'features-heading',
          type: 'heading',
          content: 'Fitur Unggulan',
          properties: {
            className: 'text-3xl md:text-4xl font-bold text-center mb-12'
          }
        },
        {
          id: 'feature-1-image',
          type: 'image',
          content: '/placeholder.svg',
          properties: {
            className: 'w-16 h-16 mx-auto mb-4'
          }
        },
        {
          id: 'feature-1-heading',
          type: 'heading',
          content: 'Editor Visual',
          properties: {
            className: 'text-xl font-semibold text-center mb-2'
          }
        },
        {
          id: 'feature-1-text',
          type: 'text',
          content: 'Edit tampilan website secara visual, langsung melihat hasilnya tanpa perlu reload halaman.',
          properties: {
            className: 'text-gray-600 text-center max-w-md mx-auto mb-12'
          }
        },
        {
          id: 'feature-2-image',
          type: 'image',
          content: '/placeholder.svg',
          properties: {
            className: 'w-16 h-16 mx-auto mb-4'
          }
        },
        {
          id: 'feature-2-heading',
          type: 'heading',
          content: 'Section Builder',
          properties: {
            className: 'text-xl font-semibold text-center mb-2'
          }
        },
        {
          id: 'feature-2-text',
          type: 'text',
          content: 'Tambahkan dan atur section baru dengan mudah untuk memperkaya konten website Anda.',
          properties: {
            className: 'text-gray-600 text-center max-w-md mx-auto mb-12'
          }
        },
        {
          id: 'feature-3-image',
          type: 'image',
          content: '/placeholder.svg',
          properties: {
            className: 'w-16 h-16 mx-auto mb-4'
          }
        },
        {
          id: 'feature-3-heading',
          type: 'heading',
          content: 'Multi Page Management',
          properties: {
            className: 'text-xl font-semibold text-center mb-2'
          }
        },
        {
          id: 'feature-3-text',
          type: 'text',
          content: 'Buat dan kelola banyak halaman untuk website lengkap dengan navigasi yang intuitif.',
          properties: {
            className: 'text-gray-600 text-center max-w-md mx-auto'
          }
        }
      ],
    },
    {
      id: 'cta-section',
      properties: {
        backgroundColor: 'bg-editor-indigo',
        paddingY: 'py-16',
        paddingX: 'px-4'
      },
      elements: [
        {
          id: 'cta-heading',
          type: 'heading',
          content: 'Siap Untuk Membangun Website Anda?',
          properties: {
            className: 'text-3xl md:text-4xl font-bold text-white text-center mb-6'
          }
        },
        {
          id: 'cta-text',
          type: 'text',
          content: 'Mulai sekarang dan nikmati kemudahan membuat website profesional.',
          properties: {
            className: 'text-lg text-white text-center max-w-2xl mx-auto mb-8'
          }
        },
        {
          id: 'cta-button',
          type: 'button',
          content: 'Daftar Gratis',
          properties: {
            className: 'bg-white text-editor-indigo hover:bg-gray-100 px-6 py-3 rounded-lg font-medium text-lg mx-auto block'
          }
        }
      ],
    }
  ],
};
