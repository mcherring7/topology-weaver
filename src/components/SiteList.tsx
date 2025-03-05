
import { useState } from "react";
import { Site, SiteCategory } from "@/types/site";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import CategoryFilter from "./sites/CategoryFilter";
import SiteCard from "./sites/SiteCard";
import AddSiteDialog from "./sites/AddSiteDialog";
import EditSiteDialog from "./sites/EditSiteDialog";
import { getCategoryColor, getConnectionColor, getProviderColor } from "@/utils/siteColors";

// Constants - Defined here for consistency and avoid duplication
const siteCategories: SiteCategory[] = ["Corporate", "Data Center", "Branch"];

interface SiteListProps {
  sites: Site[];
  onAddSite: (site: Site) => void;
  onUpdateSite: (site: Site) => void;
  onRemoveSite: (id: string) => void;
  selectedSite: Site | null;
  onSelectSite: (site: Site | null) => void;
  categoryFilters: SiteCategory[];
  onCategoryFiltersChange: (categories: SiteCategory[]) => void;
}

const SiteList = ({
  sites,
  onAddSite,
  onUpdateSite,
  onRemoveSite,
  selectedSite,
  onSelectSite,
  categoryFilters,
  onCategoryFiltersChange
}: SiteListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [siteToEdit, setSiteToEdit] = useState<Site | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const openEditDialog = (site: Site) => {
    setSiteToEdit(site);
    setIsEditDialogOpen(true);
  };

  const confirmDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      onRemoveSite(id);
      toast.success("Site removed successfully");
    }
  };

  const handleSelectSite = (site: Site) => {
    onSelectSite(selectedSite?.id === site.id ? null : site);
  };

  const resetFilters = () => {
    onCategoryFiltersChange(siteCategories);
  };

  // Filter sites based on selected categories
  const filteredSites = sites.filter(site => categoryFilters.includes(site.category));

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium">Sites</h2>
          <CategoryFilter 
            categoryFilters={categoryFilters}
            onCategoryFiltersChange={onCategoryFiltersChange}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            getCategoryColor={getCategoryColor}
            siteCategories={siteCategories}
          />
        </div>
        <AddSiteDialog 
          onAddSite={onAddSite}
          siteCategories={siteCategories}
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        />
      </div>

      <div className="overflow-y-auto flex-1 space-y-3">
        <AnimatePresence>
          {filteredSites.map((site) => (
            <SiteCard 
              key={site.id}
              site={site}
              isSelected={selectedSite?.id === site.id}
              onSelect={handleSelectSite}
              onEdit={openEditDialog}
              onDelete={confirmDelete}
              getCategoryColor={getCategoryColor}
              getConnectionColor={getConnectionColor}
              getProviderColor={getProviderColor}
            />
          ))}
        </AnimatePresence>
        
        {filteredSites.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No sites match the current filters.</p>
            <Button 
              variant="link" 
              className="mt-2" 
              onClick={resetFilters}
            >
              Reset filters
            </Button>
          </div>
        )}
      </div>

      <EditSiteDialog 
        site={siteToEdit}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdateSite={onUpdateSite}
        siteCategories={siteCategories}
      />
    </div>
  );
};

export default SiteList;
