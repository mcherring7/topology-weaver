
import { useState } from "react";
import { Site } from "@/types/site";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AnimatePresence, motion } from "framer-motion";

interface SiteListProps {
  sites: Site[];
  onAddSite: (site: Site) => void;
  onUpdateSite: (site: Site) => void;
  onRemoveSite: (id: string) => void;
  selectedSite: Site | null;
  onSelectSite: (site: Site | null) => void;
}

const connectionTypes = ["Fiber", "MPLS", "Direct Connect", "Broadband", "LTE"];
const bandwidthOptions = ["10 Mbps", "100 Mbps", "500 Mbps", "1 Gbps", "10 Gbps"];

const siteFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  connectionType: z.string().min(1, "Connection type is required"),
  bandwidth: z.string().min(1, "Bandwidth is required"),
});

type SiteFormValues = z.infer<typeof siteFormSchema>;

const SiteList = ({
  sites,
  onAddSite,
  onUpdateSite,
  onRemoveSite,
  selectedSite,
  onSelectSite,
}: SiteListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [siteToEdit, setSiteToEdit] = useState<Site | null>(null);

  const addForm = useForm<SiteFormValues>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: {
      name: "",
      location: "",
      connectionType: "Fiber",
      bandwidth: "100 Mbps",
    },
  });

  const editForm = useForm<SiteFormValues>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: {
      name: "",
      location: "",
      connectionType: "Fiber",
      bandwidth: "100 Mbps",
    },
  });

  const handleAddSubmit = (values: SiteFormValues) => {
    onAddSite({
      ...values,
      id: "",
      coordinates: { x: 0, y: 0 },
    });
    toast.success("Site added successfully");
    setIsAddDialogOpen(false);
    addForm.reset();
  };

  const handleEditSubmit = (values: SiteFormValues) => {
    if (siteToEdit) {
      onUpdateSite({
        ...siteToEdit,
        ...values,
      });
      toast.success("Site updated successfully");
      setIsEditDialogOpen(false);
      setSiteToEdit(null);
    }
  };

  const openEditDialog = (site: Site) => {
    setSiteToEdit(site);
    editForm.reset({
      name: site.name,
      location: site.location,
      connectionType: site.connectionType,
      bandwidth: site.bandwidth,
    });
    setIsEditDialogOpen(true);
  };

  const confirmDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      onRemoveSite(id);
      toast.success("Site removed successfully");
    }
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Sites</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs">
              Add Site
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Site</DialogTitle>
              <DialogDescription>
                Enter the details for the new site.
              </DialogDescription>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Headquarters" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="connectionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Connection Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select connection type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {connectionTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="bandwidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bandwidth</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select bandwidth" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bandwidthOptions.map((bandwidth) => (
                            <SelectItem key={bandwidth} value={bandwidth}>
                              {bandwidth}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Add Site</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-y-auto flex-1 space-y-3">
        <AnimatePresence>
          {sites.map((site) => (
            <motion.div
              key={site.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className={`cursor-pointer transition-all ${
                  selectedSite?.id === site.id ? "border-gray-400 shadow-md" : "border-gray-200"
                }`}
                onClick={() => onSelectSite(selectedSite?.id === site.id ? null : site)}
              >
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>{site.name}</span>
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ 
                        backgroundColor: 
                          site.connectionType === "Fiber" ? "#10b981" :
                          site.connectionType === "MPLS" ? "#3b82f6" :
                          site.connectionType === "Direct Connect" ? "#8b5cf6" :
                          site.connectionType === "Broadband" ? "#f59e0b" : "#6b7280"
                      }}
                    />
                  </CardTitle>
                  <CardDescription className="text-xs">{site.location}</CardDescription>
                </CardHeader>
                <CardContent className="py-0 px-4 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>{site.connectionType}</span>
                    <span>{site.bandwidth}</span>
                  </div>
                </CardContent>
                <CardFooter className="py-2 px-4 flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(site);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(site.id, site.name);
                    }}
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Site</DialogTitle>
            <DialogDescription>
              Update the details for this site.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="connectionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Connection Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {connectionTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="bandwidth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bandwidth</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bandwidthOptions.map((bandwidth) => (
                          <SelectItem key={bandwidth} value={bandwidth}>
                            {bandwidth}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SiteList;
