
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import NetworkTopology from "@/components/NetworkTopology";
import SiteList from "@/components/SiteList";
import { Site } from "@/types/site";
import { AnimatePresence, motion } from "framer-motion";

const Index = () => {
  const [sites, setSites] = useState<Site[]>([
    { id: "1", name: "Headquarters", location: "New York", connectionType: "Fiber", bandwidth: "1 Gbps", coordinates: { x: 0.5, y: 0.3 } },
    { id: "2", name: "Regional Office", location: "San Francisco", connectionType: "MPLS", bandwidth: "500 Mbps", coordinates: { x: 0.2, y: 0.6 } },
    { id: "3", name: "Data Center", location: "Chicago", connectionType: "Direct Connect", bandwidth: "10 Gbps", coordinates: { x: 0.8, y: 0.5 } },
    { id: "4", name: "Branch Office", location: "Miami", connectionType: "Broadband", bandwidth: "100 Mbps", coordinates: { x: 0.6, y: 0.7 } },
  ]);

  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [showSiteList, setShowSiteList] = useState(true);

  const addSite = (site: Site) => {
    setSites([...sites, { ...site, id: String(sites.length + 1), coordinates: getRandomCoordinates() }]);
  };

  const updateSite = (updatedSite: Site) => {
    setSites(sites.map(site => site.id === updatedSite.id ? updatedSite : site));
  };

  const removeSite = (id: string) => {
    setSites(sites.filter(site => site.id !== id));
    if (selectedSite?.id === id) {
      setSelectedSite(null);
    }
  };

  const getRandomCoordinates = () => {
    return {
      x: 0.2 + Math.random() * 0.6,
      y: 0.3 + Math.random() * 0.5
    };
  };

  const toggleSiteList = () => {
    setShowSiteList(!showSiteList);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 py-4 px-6 flex justify-between items-center">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-light tracking-tight text-gray-900"
        >
          Topology<span className="font-semibold">Weaver</span>
        </motion.h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleSiteList}
            className="text-sm"
          >
            {showSiteList ? "Hide Site List" : "Show Site List"}
          </Button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence>
          {showSiteList && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-80 border-r border-gray-100 bg-white overflow-y-auto"
            >
              <SiteList 
                sites={sites} 
                onAddSite={addSite} 
                onUpdateSite={updateSite} 
                onRemoveSite={removeSite}
                selectedSite={selectedSite}
                onSelectSite={setSelectedSite}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div 
          layout
          className="flex-1 p-6 overflow-hidden"
        >
          <Card className="h-full overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-normal">Network Topology</CardTitle>
              <CardDescription>
                Visual representation of your WAN connections
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-5rem)]">
              <NetworkTopology 
                sites={sites} 
                selectedSite={selectedSite} 
                onSelectSite={setSelectedSite} 
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
