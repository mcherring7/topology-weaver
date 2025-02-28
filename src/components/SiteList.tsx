
import { useState } from "react";
import { Site, Connection } from "@/types/site";
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
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { PlusCircle, X } from "lucide-react";

interface SiteListProps {
  sites: Site[];
  onAddSite: (site: Site) => void;
  onUpdateSite: (site: Site) => void;
  onRemoveSite: (id: string) => void;
  selectedSite: Site | null;
  onSelectSite: (site: Site | null) => void;
}

const connectionTypes = ["Fiber", "MPLS", "Direct Connect", "Broadband", "LTE"];
const bandwidthOptions = ["10 Mbps", "50 Mbps", "100 Mbps", "500 Mbps", "1 Gbps", "10 Gbps"];

const connectionSchema = z.object({
  type: z.string().min(1, "Connection type is required"),
  bandwidth: z.string().min(1, "Bandwidth is required"),
});

const siteFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  connections: z.array(connectionSchema)
    .min(1, "At least one connection is required")
    .max(3, "Maximum 3 connections allowed"),
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
      connections: [
        { type: "Fiber", bandwidth: "100 Mbps" }
      ],
    },
  });

  const addConnectionsField = useFieldArray({
    control: addForm.control,
    name: "connections",
  });

  const editForm = useForm<SiteFormValues>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: {
      name: "",
      location: "",
      connections: [
        { type: "Fiber", bandwidth: "100 Mbps" }
      ],
    },
  });

  const editConnectionsField = useFieldArray({
    control: editForm.control,
    name: "connections",
  });

  const handleAddSubmit = (values: SiteFormValues) => {
    // Convert the form values to a valid Site object
    const newSite: Site = {
      id: "",
      name: values.name,
      location: values.location,
      connections: values.connections.map(conn => ({
        type: conn.type,
        bandwidth: conn.bandwidth
      })),
      coordinates: { x: 0, y: 0 },
    };
    
    onAddSite(newSite);
    toast.success("Site added successfully");
    setIsAddDialogOpen(false);
    addForm.reset({
      name: "",
      location: "",
      connections: [
        { type: "Fiber", bandwidth: "100 Mbps" }
      ],
    });
  };

  const handleEditSubmit = (values: SiteFormValues) => {
    if (siteToEdit) {
      // Convert the form values to a valid Site object
      const updatedSite: Site = {
        ...siteToEdit,
        name: values.name,
        location: values.location,
        connections: values.connections.map(conn => ({
          type: conn.type,
          bandwidth: conn.bandwidth
        })),
      };
      
      onUpdateSite(updatedSite);
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
      connections: site.connections,
    });
    setIsEditDialogOpen(true);
  };

  const confirmDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      onRemoveSite(id);
      toast.success("Site removed successfully");
    }
  };

  const addConnection = (fieldArray: any) => {
    if (fieldArray.fields.length < 3) {
      fieldArray.append({ type: "Fiber", bandwidth: "100 Mbps" });
    } else {
      toast.error("Maximum 3 connections allowed");
    }
  };

  const removeConnection = (fieldArray: any, index: number) => {
    if (fieldArray.fields.length > 1) {
      fieldArray.remove(index);
    } else {
      toast.error("At least one connection is required");
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
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <FormLabel>Connections ({addConnectionsField.fields.length}/3)</FormLabel>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => addConnection(addConnectionsField)}
                      disabled={addConnectionsField.fields.length >= 3}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  {addConnectionsField.fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2 mb-3 p-2 border rounded-md">
                      <FormField
                        control={addForm.control}
                        name={`connections.${index}.type`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="text-xs">Type</FormLabel>
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
                        name={`connections.${index}.bandwidth`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="text-xs">Bandwidth</FormLabel>
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
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeConnection(addConnectionsField, index)}
                        disabled={addConnectionsField.fields.length <= 1}
                        className="h-8 w-8 p-0 mt-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {addForm.formState.errors.connections?.message && (
                    <p className="text-sm font-medium text-destructive">{addForm.formState.errors.connections.message}</p>
                  )}
                </div>

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
                    {site.connections.length > 0 && (
                      <span 
                        className="w-2 h-2 rounded-full" 
                        style={{ 
                          backgroundColor: 
                            site.connections[0].type === "Fiber" ? "#10b981" :
                            site.connections[0].type === "MPLS" ? "#3b82f6" :
                            site.connections[0].type === "Direct Connect" ? "#8b5cf6" :
                            site.connections[0].type === "Broadband" ? "#f59e0b" : 
                            site.connections[0].type === "LTE" ? "#ef4444" : "#6b7280"
                        }}
                      />
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs">{site.location}</CardDescription>
                </CardHeader>
                <CardContent className="py-0 px-4 text-xs text-gray-600">
                  <div className="flex flex-col gap-1">
                    {site.connections.map((conn, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{conn.type}</span>
                        <span>{conn.bandwidth}</span>
                      </div>
                    ))}
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
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <FormLabel>Connections ({editConnectionsField.fields.length}/3)</FormLabel>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => addConnection(editConnectionsField)}
                    disabled={editConnectionsField.fields.length >= 3}
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                
                {editConnectionsField.fields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-2 mb-3 p-2 border rounded-md">
                    <FormField
                      control={editForm.control}
                      name={`connections.${index}.type`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-xs">Type</FormLabel>
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
                      control={editForm.control}
                      name={`connections.${index}.bandwidth`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-xs">Bandwidth</FormLabel>
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
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeConnection(editConnectionsField, index)}
                      disabled={editConnectionsField.fields.length <= 1}
                      className="h-8 w-8 p-0 mt-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {editForm.formState.errors.connections?.message && (
                  <p className="text-sm font-medium text-destructive">{editForm.formState.errors.connections.message}</p>
                )}
              </div>

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
