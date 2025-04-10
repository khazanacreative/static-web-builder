import React, { useState, useEffect } from 'react';
import { useEditor } from '@/context/EditorContext';
import { Trash2, PlusCircle, GripVertical, Image, Link, Type, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MenuItem {
  id: string;
  title: string;
  url: string;
  order: number;
}

interface WebsiteIdentity {
  siteTitle: string;
  logoUrl: string;
  displayMode: 'text' | 'logo' | 'both';
}

export const NavigationManager = () => {
  const { 
    userRole, 
    navigation, 
    updateNavigation, 
    pages,
    addPage,
    updatePage
  } = useEditor();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(navigation || []);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('menu');
  const [websiteIdentity, setWebsiteIdentity] = useState<WebsiteIdentity>({
    siteTitle: 'My Website',
    logoUrl: '/placeholder.svg',
    displayMode: 'text'
  });
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [imgUploadDialogOpen, setImgUploadDialogOpen] = useState(false);
  
  const isAdmin = userRole === 'admin';
  
  useEffect(() => {
    setMenuItems(navigation);
    
    if (pages.length > 0) {
      const firstPage = pages[0];
      const headerSection = firstPage.sections.find(section => section.type === 'header');
      
      if (headerSection) {
        const titleElement = headerSection.elements.find(el => el.type === 'heading');
        const logoElement = headerSection.elements.find(el => el.type === 'image');
        
        const hasLogo = logoElement && logoElement.content && logoElement.content !== '/placeholder.svg';
        const hasTitle = titleElement && titleElement.content;
        
        let displayMode: 'text' | 'logo' | 'both' = 'text';
        if (hasLogo && !hasTitle) displayMode = 'logo';
        else if (hasLogo && hasTitle) displayMode = 'both';
        
        setWebsiteIdentity({
          siteTitle: titleElement ? titleElement.content : 'My Website',
          logoUrl: logoElement ? logoElement.content : '/placeholder.svg',
          displayMode
        });
      }
    }
  }, [pages, navigation]);
  
  const handleAddMenuItem = () => {
    const newMenuItem = {
      id: `menu-item-${Date.now()}`,
      title: 'New Link',
      url: '#',
      order: menuItems.length
    };
    
    setMenuItems([...menuItems, newMenuItem]);
  };
  
  const handleRemoveMenuItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };
  
  const handleUpdateMenuItem = (id: string, field: keyof MenuItem, value: string | number) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleLinkToExistingPage = (menuItemId: string, pageSlug: string) => {
    if (pageSlug === 'choose-page') return;
    
    const page = pages.find(p => p.slug === pageSlug);
    if (page) {
      handleUpdateMenuItem(menuItemId, 'url', pageSlug);
      handleUpdateMenuItem(menuItemId, 'title', page.title);
    }
  };
  
  const handleSaveMenu = () => {
    updateNavigation(menuItems);
    
    pages.forEach(page => {
      const headerSection = page.sections.find(section => section.type === 'header');
      if (headerSection) {
        const updatedElements = [...headerSection.elements];
        const titleElement = updatedElements.find(el => el.type === 'heading');
        const logoElement = updatedElements.find(el => el.type === 'image');
        
        if (websiteIdentity.displayMode === 'logo') {
          if (titleElement) {
            const titleIndex = updatedElements.findIndex(el => el.type === 'heading');
            if (titleIndex !== -1) {
              updatedElements.splice(titleIndex, 1);
            }
          }
        } else {
          if (titleElement) {
            updatePage(page.id, {
              sections: page.sections.map(section => 
                section.id === headerSection.id ? {
                  ...section,
                  elements: section.elements.map(el => 
                    el.id === titleElement.id ? {...el, content: websiteIdentity.siteTitle} : el
                  )
                } : section
              )
            });
          } else {
            const newTitleElement = {
              id: `header-title-${Date.now()}`,
              type: 'heading' as const,
              content: websiteIdentity.siteTitle,
              properties: {
                className: 'text-xl font-bold'
              }
            };
            updatedElements.push(newTitleElement);
          }
        }
        
        if (websiteIdentity.displayMode === 'text') {
          if (logoElement) {
            const logoIndex = updatedElements.findIndex(el => el.type === 'image');
            if (logoIndex !== -1) {
              updatedElements.splice(logoIndex, 1);
            }
          }
        } else {
          if (logoElement) {
            updatePage(page.id, {
              sections: page.sections.map(section => 
                section.id === headerSection.id ? {
                  ...section,
                  elements: section.elements.map(el => 
                    el.id === logoElement.id ? {...el, content: websiteIdentity.logoUrl} : el
                  )
                } : section
              )
            });
          } else {
            const newLogoElement = {
              id: `header-logo-${Date.now()}`,
              type: 'image' as const,
              content: websiteIdentity.logoUrl,
              properties: {
                className: 'h-10 w-auto'
              }
            };
            updatedElements.push(newLogoElement);
          }
        }
        
        if (websiteIdentity.displayMode === 'text' || websiteIdentity.displayMode === 'logo') {
          updatePage(page.id, {
            sections: page.sections.map(section => 
              section.id === headerSection.id ? {
                ...section,
                elements: updatedElements
              } : section
            )
          });
        }
      }
    });
    
    setIsDialogOpen(false);
    toast({
      title: "Settings Updated",
      description: "Your navigation menu and website identity have been updated.",
      variant: "default",
    });
  };
  
  const handleAddNewPage = () => {
    if (!newPageTitle.trim()) {
      toast({
        title: "Error",
        description: "Page title cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    let slug = newPageSlug.trim();
    if (!slug) {
      slug = `/${newPageTitle.toLowerCase().replace(/\s+/g, '-')}`;
    } else if (!slug.startsWith('/')) {
      slug = `/${slug}`;
    }
    
    const slugExists = pages.some(page => page.slug === slug);
    if (slugExists) {
      toast({
        title: "Error",
        description: `The URL "${slug}" is already in use. Please choose a different URL.`,
        variant: "destructive",
      });
      return;
    }
    
    const newPageId = `page-${Date.now()}`;
    
    addPage({
      id: newPageId,
      title: newPageTitle,
      slug: slug,
      isPublished: false,
      sections: [
        {
          id: `header-section-${Date.now()}`,
          type: 'header',
          properties: {
            backgroundColor: 'bg-white',
            paddingY: 'py-4',
            paddingX: 'px-4'
          },
          elements: [
            {
              id: `header-logo-${Date.now()}`,
              type: 'image',
              content: websiteIdentity.logoUrl,
              properties: {
                className: 'h-10 w-auto'
              }
            },
            {
              id: `header-title-${Date.now()}`,
              type: 'heading',
              content: websiteIdentity.siteTitle,
              properties: {
                className: 'text-xl font-bold'
              }
            }
          ]
        },
        {
          id: `section-${Date.now()}`,
          type: 'content',
          properties: {
            backgroundColor: 'bg-white',
            paddingY: 'py-12',
            paddingX: 'px-4'
          },
          elements: [
            {
              id: `element-${Date.now()}-heading`,
              type: 'heading',
              content: newPageTitle,
              properties: {
                className: 'text-3xl font-bold text-center mb-8'
              }
            },
            {
              id: `element-${Date.now()}-text`,
              type: 'text',
              content: 'This is a new page. Start editing to add your content.',
              properties: {
                className: 'text-center max-w-2xl mx-auto'
              }
            }
          ]
        },
        {
          id: `footer-section-${Date.now()}`,
          type: 'footer',
          properties: {
            backgroundColor: 'bg-gray-800',
            paddingY: 'py-8',
            paddingX: 'px-4'
          },
          elements: [
            {
              id: `footer-text-${Date.now()}`,
              type: 'text',
              content: '© 2025 Website Builder. All rights reserved.',
              properties: {
                className: 'text-gray-400 text-center'
              }
            }
          ]
        }
      ]
    });
    
    const newNavItem = {
      id: `menu-item-${Date.now()}`,
      title: newPageTitle,
      url: slug,
      order: menuItems.length
    };
    
    setMenuItems([...menuItems, newNavItem]);
    setNewPageTitle('');
    setNewPageSlug('');
    
    toast({
      title: "Page Created",
      description: `"${newPageTitle}" page has been created and added to navigation.`,
      variant: "default",
    });
  };
  
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newItems = [...menuItems];
    const draggedItem = newItems[draggedIndex];
    
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    
    const reorderedItems = newItems.map((item, idx) => ({
      ...item,
      order: idx
    }));
    
    setMenuItems(reorderedItems);
    setDraggedIndex(index);
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setWebsiteIdentity({
          ...websiteIdentity,
          logoUrl: reader.result as string
        });
        setImgUploadDialogOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewPageSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value && !value.startsWith('/')) {
      value = `/${value}`;
    }
    setNewPageSlug(value);
  };
  
  if (!isAdmin) return null;
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsDialogOpen(true)}
        className="flex items-center"
      >
        Edit Navigation
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Website Settings</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="menu">Navigation</TabsTrigger>
              <TabsTrigger value="pages">Pages</TabsTrigger>
              <TabsTrigger value="identity">Website Identity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="menu">
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <div className="font-medium w-12">Order</div>
                  <div className="font-medium flex-1">Title</div>
                  <div className="font-medium flex-1">URL</div>
                  <div className="font-medium w-20">Link to</div>
                  <div className="w-8"></div>
                </div>
                
                {menuItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="flex items-center space-x-2 bg-white p-2 border rounded"
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                  >
                    <div className="cursor-move">
                      <GripVertical size={16} />
                    </div>
                    <Input 
                      value={item.title}
                      onChange={(e) => handleUpdateMenuItem(item.id, 'title', e.target.value)}
                      className="flex-1"
                    />
                    <Input 
                      value={item.url}
                      onChange={(e) => handleUpdateMenuItem(item.id, 'url', e.target.value)}
                      className="flex-1"
                    />
                    <Select
                      onValueChange={(value) => handleLinkToExistingPage(item.id, value)}
                    >
                      <SelectTrigger className="w-20">
                        <Link size={14} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="choose-page">Choose page</SelectItem>
                        {pages.map(page => (
                          <SelectItem key={page.id} value={page.slug}>
                            {page.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button 
                      onClick={() => handleRemoveMenuItem(item.id)}
                      className="text-red-500 p-1 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddMenuItem}
                >
                  <PlusCircle size={16} className="mr-1" />
                  Add Menu Item
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="pages">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium mb-2">Add New Page</h4>
                  <div className="space-y-2">
                    <Input
                      value={newPageTitle}
                      onChange={(e) => setNewPageTitle(e.target.value)}
                      placeholder="Enter page title"
                    />
                    <Input
                      value={newPageSlug}
                      onChange={handleNewPageSlugChange}
                      placeholder="Custom URL (optional)"
                    />
                    <Button onClick={handleAddNewPage} className="w-full">
                      <PlusCircle size={16} className="mr-1" />
                      Add Page
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Existing Pages</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {pages.map(page => (
                      <div key={page.id} className="flex justify-between items-center p-2 bg-white border rounded">
                        <span className="font-medium">{page.title}</span>
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {page.slug}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="identity">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="font-medium">Display Mode</label>
                  <Select 
                    value={websiteIdentity.displayMode} 
                    onValueChange={handleDisplayModeChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select display mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">
                        <div className="flex items-center">
                          <Type className="h-4 w-4 mr-2" />
                          Text Only
                        </div>
                      </SelectItem>
                      <SelectItem value="logo">
                        <div className="flex items-center">
                          <Image className="h-4 w-4 mr-2" />
                          Logo Only
                        </div>
                      </SelectItem>
                      <SelectItem value="both">
                        <div className="flex items-center">
                          <Layout className="h-4 w-4 mr-2" />
                          Logo & Text
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {(websiteIdentity.displayMode === 'text' || websiteIdentity.displayMode === 'both') && (
                  <div className="space-y-2">
                    <label className="font-medium">Website Title</label>
                    <Input
                      value={websiteIdentity.siteTitle}
                      onChange={(e) => setWebsiteIdentity({...websiteIdentity, siteTitle: e.target.value})}
                    />
                  </div>
                )}
                
                {(websiteIdentity.displayMode === 'logo' || websiteIdentity.displayMode === 'both') && (
                  <div className="space-y-2">
                    <label className="font-medium">Logo</label>
                    <div className="flex items-center space-x-4">
                      <div className="border p-2 rounded w-16 h-16 flex items-center justify-center">
                        <img 
                          src={websiteIdentity.logoUrl} 
                          alt="Logo" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setImgUploadDialogOpen(true)}
                      >
                        <Image size={16} className="mr-2" />
                        Change Logo
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveMenu}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={imgUploadDialogOpen} onOpenChange={setImgUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Logo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Select an image from your device to use as the website logo.
            </p>
            <Input 
              type="file" 
              accept="image/*" 
              onChange={handleLogoUpload} 
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setImgUploadDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
