
import React, { createContext, useState, useContext, ReactNode } from 'react';

export type ElementType = 'heading' | 'text' | 'image' | 'button' | 'section';
export type UserRole = 'viewer' | 'editor' | 'admin';

export interface PageElement {
  id: string;
  type: ElementType;
  content: string;
  properties?: Record<string, any>;
  gridPosition?: {
    column: string;
    row: string;
    columnSpan: string;
    rowSpan: string;
  };
}

export interface Section {
  id: string;
  elements: PageElement[];
  properties?: {
    backgroundColor?: string;
    paddingY?: string;
    paddingX?: string;
    isGridLayout?: boolean;
    gridColumns?: string;
    gridRows?: string;
    gridGap?: string;
  };
  type?: 'content' | 'header' | 'footer';
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  sections: Section[];
  isPublished: boolean;
  publishedAt?: string;
}

interface EditorContextType {
  pages: Page[];
  currentPageId: string;
  isEditMode: boolean;
  selectedElementId: string | null;
  userRole: UserRole;
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
  setUserRole: (role: UserRole) => void;
  publishPage: (pageId: string) => void;
  unpublishPage: (pageId: string) => void;
  replaceHeaderSection: (pageId: string, section: Section) => void;
  replaceFooterSection: (pageId: string, section: Section) => void;
}

export const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pages, setPages] = useState<Page[]>([defaultHomePage]);
  const [currentPageId, setCurrentPageId] = useState(defaultHomePage.id);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('viewer');

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
    if (userRole === 'viewer') {
      return; // Viewers cannot toggle edit mode
    }
    
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

  const publishPage = (pageId: string) => {
    setPages((prevPages) =>
      prevPages.map((page) =>
        page.id === pageId
          ? { ...page, isPublished: true, publishedAt: new Date().toISOString() }
          : page
      )
    );
  };

  const unpublishPage = (pageId: string) => {
    setPages((prevPages) =>
      prevPages.map((page) =>
        page.id === pageId ? { ...page, isPublished: false } : page
      )
    );
  };

  const replaceHeaderSection = (pageId: string, newHeaderSection: Section) => {
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id === pageId) {
          // Find existing header section
          const headerIndex = page.sections.findIndex(section => section.type === 'header');
          const updatedSections = [...page.sections];
          
          // Set type for new header section
          const sectionWithType = { ...newHeaderSection, type: 'header' };
          
          if (headerIndex >= 0) {
            // Replace existing header
            updatedSections[headerIndex] = sectionWithType;
          } else {
            // Add new header at the beginning
            updatedSections.unshift(sectionWithType);
          }
          
          return {
            ...page,
            sections: updatedSections
          };
        }
        return page;
      })
    );
  };

  const replaceFooterSection = (pageId: string, newFooterSection: Section) => {
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id === pageId) {
          // Find existing footer section
          const footerIndex = page.sections.findIndex(section => section.type === 'footer');
          const updatedSections = [...page.sections];
          
          // Set type for new footer section
          const sectionWithType = { ...newFooterSection, type: 'footer' };
          
          if (footerIndex >= 0) {
            // Replace existing footer
            updatedSections[footerIndex] = sectionWithType;
          } else {
            // Add new footer at the end
            updatedSections.push(sectionWithType);
          }
          
          return {
            ...page,
            sections: updatedSections
          };
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
    userRole,
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
    getSelectedElement,
    setUserRole,
    publishPage,
    unpublishPage,
    replaceHeaderSection,
    replaceFooterSection
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
  isPublished: true,
  publishedAt: new Date().toISOString(),
  sections: [
    {
      id: 'header-section',
      type: 'header',
      properties: {
        backgroundColor: 'bg-white',
        paddingY: 'py-4',
        paddingX: 'px-4'
      },
      elements: [
        {
          id: 'header-logo',
          type: 'image',
          content: '/placeholder.svg',
          properties: {
            className: 'h-10 w-auto'
          }
        },
        {
          id: 'header-title',
          type: 'heading',
          content: 'My Website',
          properties: {
            className: 'text-xl font-bold'
          }
        }
      ],
    },
    {
      id: 'hero-section',
      type: 'content',
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
      type: 'content',
      properties: {
        backgroundColor: 'bg-white',
        paddingY: 'py-16',
        paddingX: 'px-4',
        isGridLayout: true,
        gridColumns: 'grid-cols-1 md:grid-cols-3',
        gridRows: 'auto',
        gridGap: 'gap-8'
      },
      elements: [
        {
          id: 'features-heading',
          type: 'heading',
          content: 'Fitur Unggulan',
          properties: {
            className: 'text-3xl md:text-4xl font-bold text-center mb-12 col-span-full'
          },
          gridPosition: {
            column: 'col-span-full',
            row: 'row-start-1',
            columnSpan: '',
            rowSpan: ''
          }
        },
        {
          id: 'feature-1-image',
          type: 'image',
          content: '/placeholder.svg',
          properties: {
            className: 'w-16 h-16 mx-auto mb-4'
          },
          gridPosition: {
            column: 'md:col-start-1',
            row: 'row-start-2',
            columnSpan: '',
            rowSpan: ''
          }
        },
        {
          id: 'feature-1-heading',
          type: 'heading',
          content: 'Editor Visual',
          properties: {
            className: 'text-xl font-semibold text-center mb-2'
          },
          gridPosition: {
            column: 'md:col-start-1',
            row: 'row-start-3',
            columnSpan: '',
            rowSpan: ''
          }
        },
        {
          id: 'feature-1-text',
          type: 'text',
          content: 'Edit tampilan website secara visual, langsung melihat hasilnya tanpa perlu reload halaman.',
          properties: {
            className: 'text-gray-600 text-center max-w-md mx-auto mb-12'
          },
          gridPosition: {
            column: 'md:col-start-1',
            row: 'row-start-4',
            columnSpan: '',
            rowSpan: ''
          }
        },
        {
          id: 'feature-2-image',
          type: 'image',
          content: '/placeholder.svg',
          properties: {
            className: 'w-16 h-16 mx-auto mb-4'
          },
          gridPosition: {
            column: 'md:col-start-2',
            row: 'row-start-2',
            columnSpan: '',
            rowSpan: ''
          }
        },
        {
          id: 'feature-2-heading',
          type: 'heading',
          content: 'Section Builder',
          properties: {
            className: 'text-xl font-semibold text-center mb-2'
          },
          gridPosition: {
            column: 'md:col-start-2',
            row: 'row-start-3',
            columnSpan: '',
            rowSpan: ''
          }
        },
        {
          id: 'feature-2-text',
          type: 'text',
          content: 'Tambahkan dan atur section baru dengan mudah untuk memperkaya konten website Anda.',
          properties: {
            className: 'text-gray-600 text-center max-w-md mx-auto mb-12'
          },
          gridPosition: {
            column: 'md:col-start-2',
            row: 'row-start-4',
            columnSpan: '',
            rowSpan: ''
          }
        },
        {
          id: 'feature-3-image',
          type: 'image',
          content: '/placeholder.svg',
          properties: {
            className: 'w-16 h-16 mx-auto mb-4'
          },
          gridPosition: {
            column: 'md:col-start-3',
            row: 'row-start-2',
            columnSpan: '',
            rowSpan: ''
          }
        },
        {
          id: 'feature-3-heading',
          type: 'heading',
          content: 'Multi Page Management',
          properties: {
            className: 'text-xl font-semibold text-center mb-2'
          },
          gridPosition: {
            column: 'md:col-start-3',
            row: 'row-start-3',
            columnSpan: '',
            rowSpan: ''
          }
        },
        {
          id: 'feature-3-text',
          type: 'text',
          content: 'Buat dan kelola banyak halaman untuk website lengkap dengan navigasi yang intuitif.',
          properties: {
            className: 'text-gray-600 text-center max-w-md mx-auto'
          },
          gridPosition: {
            column: 'md:col-start-3',
            row: 'row-start-4',
            columnSpan: '',
            rowSpan: ''
          }
        }
      ],
    },
    {
      id: 'cta-section',
      type: 'content',
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
    },
    {
      id: 'footer-section',
      type: 'footer',
      properties: {
        backgroundColor: 'bg-gray-800',
        paddingY: 'py-8',
        paddingX: 'px-4'
      },
      elements: [
        {
          id: 'footer-text',
          type: 'text',
          content: '© 2025 Website Builder. All rights reserved.',
          properties: {
            className: 'text-gray-400 text-center'
          }
        }
      ],
    }
  ],
};
