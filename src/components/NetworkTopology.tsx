
import { useRef, useEffect, useState } from "react";
import { Site } from "@/types/site";
import { motion, AnimatePresence } from "framer-motion";

interface NetworkTopologyProps {
  sites: Site[];
  selectedSite: Site | null;
  onSelectSite: (site: Site | null) => void;
}

const NetworkTopology = ({ sites, selectedSite, onSelectSite }: NetworkTopologyProps) => {
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
      default:
        return "#6b7280"; // Gray
    }
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full bg-gray-50 overflow-hidden"
    >
      {/* Internet Cloud */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
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

      {/* Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {sites.map((site) => {
          const startX = site.coordinates.x * dimensions.width;
          const startY = site.coordinates.y * dimensions.height;
          const endX = dimensions.width / 2;
          const endY = dimensions.height / 2;

          return (
            <motion.g key={`connection-${site.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                d={`M ${startX} ${startY} Q ${(startX + endX) / 2} ${(startY + endY) / 2 + (Math.random() * 30 - 15)}, ${endX} ${endY}`}
                fill="none"
                stroke={getConnectionColor(site.connectionType)}
                strokeWidth={selectedSite?.id === site.id || hoveredSite === site.id ? 3 : 2}
                strokeDasharray={site.connectionType === "MPLS" ? "5,5" : undefined}
                strokeOpacity={selectedSite && selectedSite.id !== site.id ? 0.3 : 1}
              />
            </motion.g>
          );
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
              x: posX,
              y: posY
            }}
            transition={{ type: "spring", damping: 20 }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
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
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getConnectionColor(site.connectionType) }}
              />
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
                    <div className="flex items-center gap-1">
                      <span 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: getConnectionColor(site.connectionType) }}
                      />
                      <span>{site.connectionType}</span>
                    </div>
                    <div>{site.bandwidth}</div>
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
