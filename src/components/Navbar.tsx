
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Eye, ChevronDown, Globe, Lock, User, UserCog, Menu, LogIn } from 'lucide-react';
import { useEditor } from '@/context/EditorContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useToast } from "@/hooks/use-toast";
import { NavigationManager } from './NavigationManager';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar: React.FC = () => {
  const { isEditMode, toggleEditMode, pages, currentPageId, userRole, setUserRole, publishPage, unpublishPage, navigation, saveEditorChanges } = useEditor();
  const { toast } = useToast();
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [websiteIdentity, setWebsiteIdentity] = useState({
    siteTitle: 'Website Identity',
    logoUrl: '',
    displayMode: 'text' // 'text', 'logo', or 'both'
  });
  const isMobile = useIsMobile();

  const currentPage = pages.find((page) => page.id === currentPageId);
  
  // Extract website identity from the current page's header section
  useEffect(() => {
    if (pages.length > 0) {
      const firstPage = pages[0];
      const headerSection = firstPage.sections.find(section => section.type === 'header');
      
      if (headerSection) {
        const titleElement = headerSection.elements.find(el => el.type === 'heading');
        const logoElement = headerSection.elements.find(el => el.type === 'image');
        
        const hasLogo = logoElement && logoElement.content && logoElement.content !== '/placeholder.svg';
        const hasTitle = titleElement && titleElement.content;
        
        let displayMode = 'text';
        if (hasLogo && !hasTitle) displayMode = 'logo';
        else if (hasLogo && hasTitle) displayMode = 'both';
        
        setWebsiteIdentity({
          siteTitle: titleElement ? titleElement.content : 'Website Identity',
          logoUrl: logoElement ? logoElement.content : '',
          displayMode
        });
      }
    }
  }, [pages]);
  
  const handleToggleEditMode = () => {
    if (userRole === 'viewer') {
      toast({
        title: "Permission Denied",
        description: "Viewers cannot edit content. Please switch to Editor or Admin role.",
        variant: "destructive",
      });
      return;
    }
    toggleEditMode();
  };

  const handlePublish = async () => {
    if (currentPage) {
      setIsSaving(true);
      try {
        // First save all changes
        await saveEditorChanges();
        
        // Then publish the page
        publishPage(currentPage.id);
        setPublishDialogOpen(false);
        toast({
          title: "Page Published",
          description: `${currentPage.title} has been published successfully.`,
          variant: "default",
        });
      } catch (error) {
        toast({
          title: "Publish Failed",
          description: "There was an error publishing the page.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleUnpublish = () => {
    if (currentPage) {
      unpublishPage(currentPage.id);
      setPublishDialogOpen(false);
      toast({
        title: "Page Unpublished",
        description: `${currentPage.title} has been unpublished.`,
        variant: "default",
      });
    }
  };

  const handleRoleChange = (role: 'viewer' | 'editor' | 'admin') => {
    setUserRole(role);
    setRoleDialogOpen(false);
    toast({
      title: "Role Changed",
      description: `Your role has been changed to ${role}.`,
      variant: "default",
    });
    
    // If changing to viewer mode, exit edit mode
    if (role === 'viewer' && isEditMode) {
      toggleEditMode();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-xl font-bold text-editor-blue">
              {/* Website Identity - Now supports text, logo, or both */}
              {(websiteIdentity.displayMode === 'logo' || websiteIdentity.displayMode === 'both') && websiteIdentity.logoUrl && (
                <img 
                  src={websiteIdentity.logoUrl} 
                  alt="Logo" 
                  className="h-8 w-auto mr-2" 
                />
              )}
              {(websiteIdentity.displayMode === 'text' || websiteIdentity.displayMode === 'both') && (
                <span className="site-identity">{websiteIdentity.siteTitle}</span>
              )}
            </Link>
            
            <div className="hidden md:flex ml-6">
              <NavigationMenu>
                <NavigationMenuList>
                  {navigation.map((item) => (
                    <NavigationMenuItem key={item.id}>
                      <Link 
                        to={item.url} 
                        className="px-3 py-2 text-gray-700 hover:text-editor-blue"
                      >
                        {item.title}
                      </Link>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {/* Only show Navigation Manager for admin */}
            {userRole === 'admin' && <NavigationManager />}
            
            {/* Login/Role Button */}
            <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                  {userRole === 'viewer' ? (
                    <>
                      <LogIn className="h-4 w-4" />
                      <span>Login</span>
                    </>
                  ) : userRole === 'editor' ? (
                    <>
                      <Pencil className="h-4 w-4" />
                      <span>Editor</span>
                    </>
                  ) : (
                    <>
                      <UserCog className="h-4 w-4" />
                      <span>Admin</span>
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change User Role</DialogTitle>
                  <DialogDescription>
                    Select your role to change permission levels
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Button variant={userRole === 'viewer' ? "default" : "outline"} onClick={() => handleRoleChange('viewer')} className="justify-start">
                    <User className="mr-2 h-4 w-4" />
                    Viewer (can only view content)
                  </Button>
                  <Button variant={userRole === 'editor' ? "default" : "outline"} onClick={() => handleRoleChange('editor')} className="justify-start">
                    <Pencil className="mr-2 h-4 w-4" />
                    Editor (can edit content)
                  </Button>
                  <Button variant={userRole === 'admin' ? "default" : "outline"} onClick={() => handleRoleChange('admin')} className="justify-start">
                    <UserCog className="mr-2 h-4 w-4" />
                    Admin (full permissions)
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Edit Mode Toggle - Only for editors and admins */}
            {userRole !== 'viewer' && (
              <Button
                variant={isEditMode ? "default" : "outline"}
                size="sm"
                onClick={handleToggleEditMode}
                className="gap-2"
              >
                {isEditMode ? (
                  <>
                    <Eye className="h-4 w-4" />
                    Preview
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </>
                )}
              </Button>
            )}
            
            {/* Publish Button (Admin Only) */}
            {userRole === 'admin' && (
              <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" className={cn(
                    "bg-green-600 hover:bg-green-700",
                    isSaving && "opacity-70 cursor-not-allowed"
                  )} disabled={isSaving}>
                    <Globe className="h-4 w-4 mr-1" />
                    {isSaving ? 'Saving...' : currentPage?.isPublished ? 'Published' : 'Publish'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{currentPage?.isPublished ? 'Unpublish Page?' : 'Publish Page?'}</DialogTitle>
                    <DialogDescription>
                      {currentPage?.isPublished 
                        ? 'This page will no longer be visible to visitors.'
                        : 'This will make your page visible to all visitors.'}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>
                      Cancel
                    </Button>
                    {currentPage?.isPublished ? (
                      <Button variant="destructive" onClick={handleUnpublish}>
                        Unpublish
                      </Button>
                    ) : (
                      <Button 
                        variant="default" 
                        className="bg-green-600 hover:bg-green-700" 
                        onClick={handlePublish}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Publish'}
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Pages Dropdown - Only for editors and admins */}
            {userRole !== 'viewer' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center">
                    Pages <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {pages.map((page) => (
                    <DropdownMenuItem key={page.id} asChild>
                      <Link to={page.slug} className="flex items-center">
                        {page.title}
                        {page.isPublished ? (
                          <Globe className="ml-2 h-3 w-3 text-green-600" />
                        ) : (
                          <Lock className="ml-2 h-3 w-3 text-amber-600" />
                        )}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link 
                  key={item.id}
                  to={item.url}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-editor-blue"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
            </div>
            
            <div className="mt-3 pt-3 border-t space-y-2 px-4">
              {/* Role Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRoleDialogOpen(true)}
                className="w-full justify-center"
              >
                {userRole === 'viewer' ? 'Login' : `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Mode`}
              </Button>
              
              {/* Edit Mode - Only for editors and admins */}
              {userRole !== 'viewer' && (
                <Button
                  variant={isEditMode ? "default" : "outline"}
                  size="sm"
                  onClick={handleToggleEditMode}
                  className="w-full justify-center"
                >
                  {isEditMode ? "Preview Mode" : "Edit Mode"}
                </Button>
              )}
              
              {/* Publish - Only for admins */}
              {userRole === 'admin' && (
                <Button 
                  variant="default"
                  size="sm" 
                  className="w-full justify-center bg-green-600 hover:bg-green-700"
                  onClick={() => setPublishDialogOpen(true)}
                >
                  {currentPage?.isPublished ? 'Published' : 'Publish'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
