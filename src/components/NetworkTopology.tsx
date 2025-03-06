
import { useRef, useEffect, useState } from "react";
import { Site } from "@/types/site";
import { motion, AnimatePresence } from "framer-motion";
import { getCategoryColor, getConnectionColor, getProviderColor } from "@/utils/siteColors";

interface NetworkTopologyProps {
  sites: Site[];
  selectedSite: Site | null;
  onSelectSite: (site: Site | null) => void;
  onUpdateSiteCoordinates: (siteId: string, coordinates: { x: number; y: number }) => void;
}

const NetworkTopology = ({ 
  sites, 
  selectedSite, 
  onSelectSite,
  onUpdateSiteCoordinates
}: NetworkTopologyProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredSite, setHoveredSite] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [sitePositions, setSitePositions] = useState<Record<string, {x: number, y: number}>>({});

  // Update positions when sites or dimensions change
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    
    const positions: Record<string, {x: number, y: number}> = {};
    sites.forEach(site => {
      positions[site.id] = {
        x: site.coordinates.x * dimensions.width,
        y: site.coordinates.y * dimensions.height
      };
    });
    setSitePositions(positions);
  }, [sites, dimensions]);

  // Update canvas dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        if (width > 0 && height > 0 && (width !== dimensions.width || height !== dimensions.height)) {
          setDimensions({
            width,
            height,
          });
        }
      }
    };

    updateDimensions();
    
    window.addEventListener("resize", updateDimensions);
    
    // Check dimensions multiple times to ensure we have the correct values
    const timeoutIds = [100, 200, 300, 500, 1000].map(delay => 
      setTimeout(updateDimensions, delay)
    );
    
    return () => {
      window.removeEventListener("resize", updateDimensions);
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, []);

  const getDistanceFactors = () => {
    const siteFactor = Math.max(0.3, 1 - (sites.length / 50));
    return {
      internetDistance: dimensions.height * 0.25 * siteFactor,
      mplsDistance: dimensions.height * 0.25 * siteFactor
    };
  };

  const { internetDistance, mplsDistance } = getDistanceFactors();

  const handleDragStart = (siteId: string) => {
    setIsDragging(siteId);
  };

  const handleDrag = (event: any, info: any, siteId: string) => {
    if (canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      const newX = Math.max(30, Math.min(canvasRect.width - 30, info.point.x - canvasRect.left));
      const newY = Math.max(30, Math.min(canvasRect.height - 30, info.point.y - canvasRect.top));
      
      setSitePositions(prev => ({
        ...prev,
        [siteId]: { x: newX, y: newY }
      }));
    }
  };

  const handleDragEnd = (event: any, info: any, siteId: string) => {
    setIsDragging(null);
    
    if (canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      const newX = Math.max(30, Math.min(canvasRect.width - 30, info.point.x - canvasRect.left));
      const newY = Math.max(30, Math.min(canvasRect.height - 30, info.point.y - canvasRect.top));
      
      const relativeX = newX / dimensions.width;
      const relativeY = newY / dimensions.height;
      
      onUpdateSiteCoordinates(siteId, { 
        x: Math.max(0.05, Math.min(0.95, relativeX)),
        y: Math.max(0.05, Math.min(0.95, relativeY))
      });
    }
  };

  // Calculate connection paths between sites and internet/MPLS clouds
  const calculateConnectionPaths = () => {
    const paths: JSX.Element[] = [];
    
    sites.forEach((site) => {
      const sitePos = sitePositions[site.id] || {
        x: site.coordinates.x * dimensions.width,
        y: site.coordinates.y * dimensions.height
      };
      
      if (!sitePos) return;
      
      site.connections.forEach((connection, idx) => {
        const isMPLS = connection.type === "MPLS";
        const targetX = dimensions.width / 2;
        const targetY = isMPLS ? dimensions.height * (2/3) : dimensions.height / 3;
        
        // Adjust offset angle based on number of connections
        const offsetAngle = (idx - (site.connections.length - 1) / 2) * 0.15;
        const controlPointOffset = 30 + (idx * 10);
        
        // Calculate midpoint
        const midX = (sitePos.x + targetX) / 2;
        const midY = (sitePos.y + targetY) / 2;
        
        // Calculate direction vector
        const dx = targetX - sitePos.x;
        const dy = targetY - sitePos.y;
        
        // Calculate normal angle (perpendicular to the direction)
        const normalAngle = Math.atan2(dy, dx) + Math.PI/2;
        
        // Calculate control point with offset
        const controlX = midX + Math.cos(normalAngle + offsetAngle) * controlPointOffset;
        const controlY = midY + Math.sin(normalAngle + offsetAngle) * controlPointOffset;
        
        const connectionColor = connection.provider 
          ? getProviderColor(connection.provider) 
          : getConnectionColor(connection.type);
          
        paths.push(
          <motion.path
            key={`${site.id}-connection-${idx}`}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            d={`M ${sitePos.x} ${sitePos.y} Q ${controlX} ${controlY}, ${targetX} ${targetY}`}
            fill="none"
            stroke={connectionColor}
            strokeWidth={selectedSite?.id === site.id || hoveredSite === site.id ? 3 : 2}
            strokeDasharray={isMPLS ? "5,5" : undefined}
            strokeOpacity={selectedSite && selectedSite.id !== site.id ? 0.3 : 1}
          />
        );
      });
    });
    
    return paths;
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full bg-gray-50 overflow-hidden"
    >
      {/* Internet Cloud */}
      <div
        className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{
          width: dimensions.width * 0.25,
          height: dimensions.height * 0.25,
          minWidth: 120,
          minHeight: 80,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full h-full bg-white rounded-full shadow-md flex items-center justify-center border border-gray-100"
        >
          <svg
            className="w-16 h-16 text-gray-300"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
          </svg>
          <span className="absolute text-xs font-light text-gray-500 mt-12">Internet</span>
        </motion.div>
      </div>

      {/* MPLS Cloud */}
      <div
        className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 translate-y-1/2"
        style={{
          width: dimensions.width * 0.25,
          height: dimensions.height * 0.25,
          minWidth: 120,
          minHeight: 80,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full h-full bg-white rounded-full shadow-md flex items-center justify-center border border-blue-100"
        >
          <svg
            className="w-16 h-16 text-blue-200"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
          </svg>
          <span className="absolute text-xs font-light text-blue-500 mt-12">MPLS</span>
        </motion.div>
      </div>

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {calculateConnectionPaths()}
      </svg>

      {/* Site nodes */}
      {sites.map((site) => {
        const position = sitePositions[site.id] || { 
          x: site.coordinates.x * dimensions.width, 
          y: site.coordinates.y * dimensions.height 
        };
            
        const isSelected = selectedSite?.id === site.id;
        const isHovered = hoveredSite === site.id;
        const isDraggingThis = isDragging === site.id;

        const scaleFactor = Math.max(0.6, 1 - (sites.length / 60));
        const siteSize = {
          width: 50 * scaleFactor,
          height: 50 * scaleFactor
        };

        return (
          <motion.div
            key={site.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: isSelected || isHovered ? 1.1 : 1, 
              opacity: selectedSite && !isSelected ? 0.7 : 1,
              x: position.x,
              y: position.y,
              zIndex: isDraggingThis ? 50 : 10
            }}
            drag
            dragMomentum={false}
            dragElastic={0}
            onDragStart={() => handleDragStart(site.id)}
            onDrag={(event, info) => handleDrag(event, info, site.id)}
            onDragEnd={(event, info) => handleDragEnd(event, info, site.id)}
            whileDrag={{ scale: 1.1 }}
            transition={{ 
              type: "spring", 
              damping: 20,
              // Make x/y transitions smoother
              x: { type: "spring", stiffness: 300, damping: 30 },
              y: { type: "spring", stiffness: 300, damping: 30 }
            }}
            className={`absolute cursor-pointer ${isDraggingThis ? 'z-50' : 'z-10'}`}
            style={{ 
              touchAction: "none",
              transform: "translate(-50%, -50%)",
            }}
            onClick={() => onSelectSite(isSelected ? null : site)}
            onMouseEnter={() => setHoveredSite(site.id)}
            onMouseLeave={() => setHoveredSite(null)}
          >
            <div 
              className={`rounded-full p-3 shadow-md transition-colors border ${
                isSelected ? "border-gray-400" : "border-gray-200"
              }`}
              style={{ 
                backgroundColor: "white",
                borderColor: getCategoryColor(site.category),
                borderWidth: "2px"
              }}
            >
              {site.connections.length > 0 && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: site.connections[0].provider 
                    ? getProviderColor(site.connections[0].provider) 
                    : getConnectionColor(site.connections[0].type) 
                  }}
                />
              )}
            </div>
            
            <div 
              className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap z-20`}
              style={{
                opacity: 1,
                pointerEvents: 'none'
              }}
            >
              <div className="bg-white px-2 py-1 rounded text-xs shadow-sm">
                {site.name}
              </div>
              <AnimatePresence>
                {(isSelected || isHovered || isDraggingThis) && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="bg-white mt-1 px-2 py-1 rounded text-xs shadow-sm"
                  >
                    <div className="flex items-center gap-1">
                      <span 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: getCategoryColor(site.category) }}
                      />
                      <span>{site.category} - {site.location}</span>
                    </div>
                    {site.connections.map((connection, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: connection.provider 
                            ? getProviderColor(connection.provider) 
                            : getConnectionColor(connection.type)
                          }}
                        />
                        <span>
                          {connection.type}: {connection.bandwidth}
                          {connection.provider && <span className="ml-1 text-gray-500">({connection.provider})</span>}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default NetworkTopology;
