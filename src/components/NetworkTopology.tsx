
import { useRef, useEffect, useState } from "react";
import { Site } from "@/types/site";
import { motion, AnimatePresence } from "framer-motion";

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

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        setDimensions({
          width: canvasRef.current.offsetWidth,
          height: canvasRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  const getConnectionColor = (connectionType: string) => {
    switch (connectionType) {
      case "Fiber":
        return "#10b981"; // Green
      case "MPLS":
        return "#3b82f6"; // Blue
      case "Direct Connect":
        return "#8b5cf6"; // Purple
      case "Broadband":
        return "#f59e0b"; // Yellow
      case "LTE":
        return "#ef4444"; // Red
      default:
        return "#6b7280"; // Gray
    }
  };

  const handleDragEnd = (event: any, info: any, siteId: string) => {
    if (canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const newX = info.point.x - canvasRect.left;
      const newY = info.point.y - canvasRect.top;
      
      // Convert to relative coordinates (0-1 range)
      const relativeX = Math.max(0, Math.min(1, newX / dimensions.width));
      const relativeY = Math.max(0, Math.min(1, newY / dimensions.height));
      
      onUpdateSiteCoordinates(siteId, { x: relativeX, y: relativeY });
    }
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

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {sites.map((site) => {
          const startX = site.coordinates.x * dimensions.width;
          const startY = site.coordinates.y * dimensions.height;
          
          return site.connections.map((connection, idx) => {
            // Determine connection target (Internet or MPLS)
            const isMPLS = connection.type === "MPLS";
            const endX = dimensions.width / 2;
            const endY = isMPLS ? dimensions.height * (2/3) : dimensions.height / 3;
            
            // Slight offset for multiple connections
            const offsetAngle = (idx - (site.connections.length - 1) / 2) * 0.15;
            const controlPointOffset = 30 + (idx * 10);
            
            // Calculate control point with offset
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            const dx = endX - startX;
            const dy = endY - startY;
            const normalAngle = Math.atan2(dy, dx) + Math.PI/2;
            const controlX = midX + Math.cos(normalAngle + offsetAngle) * controlPointOffset;
            const controlY = midY + Math.sin(normalAngle + offsetAngle) * controlPointOffset;

            return (
              <motion.path
                key={`${site.id}-connection-${idx}`}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                d={`M ${startX} ${startY} Q ${controlX} ${controlY}, ${endX} ${endY}`}
                fill="none"
                stroke={getConnectionColor(connection.type)}
                strokeWidth={selectedSite?.id === site.id || hoveredSite === site.id ? 3 : 2}
                strokeDasharray={isMPLS ? "5,5" : undefined}
                strokeOpacity={selectedSite && selectedSite.id !== site.id ? 0.3 : 1}
              />
            );
          });
        })}
      </svg>

      {/* Sites */}
      {sites.map((site) => {
        const posX = site.coordinates.x * dimensions.width;
        const posY = site.coordinates.y * dimensions.height;
        const isSelected = selectedSite?.id === site.id;
        const isHovered = hoveredSite === site.id;

        return (
          <motion.div
            key={site.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: isSelected || isHovered ? 1.1 : 1, 
              opacity: selectedSite && !isSelected ? 0.7 : 1,
            }}
            drag
            dragMomentum={false}
            onDragEnd={(event, info) => handleDragEnd(event, info, site.id)}
            whileDrag={{ scale: 1.1 }}
            transition={{ type: "spring", damping: 20 }}
            className="absolute cursor-pointer"
            style={{ 
              left: posX, 
              top: posY, 
              touchAction: "none",
              transform: "translate(-50%, -50%)" 
            }}
            onClick={() => onSelectSite(isSelected ? null : site)}
            onMouseEnter={() => setHoveredSite(site.id)}
            onMouseLeave={() => setHoveredSite(null)}
          >
            <div 
              className={`rounded-full p-3 shadow-md transition-colors border ${
                isSelected ? "border-gray-400" : "border-gray-200"
              }`}
              style={{ backgroundColor: "white" }}
            >
              {site.connections.length > 0 && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getConnectionColor(site.connections[0].type) }}
                />
              )}
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
              <div className="bg-white px-2 py-1 rounded text-xs shadow-sm">
                {site.name}
              </div>
              <AnimatePresence>
                {(isSelected || isHovered) && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="bg-white mt-1 px-2 py-1 rounded text-xs shadow-sm"
                  >
                    <div>{site.location}</div>
                    {site.connections.map((connection, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: getConnectionColor(connection.type) }}
                        />
                        <span>{connection.type}: {connection.bandwidth}</span>
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
