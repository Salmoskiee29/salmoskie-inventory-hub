import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, InventoryItem, addRecord } from '@/lib/store';
import { isAdmin, getSession } from '@/lib/auth';
import { Plus, Edit, Trash2, Package } from 'lucide-react';

const Inventory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    quantity: 0,
    unit: '',
    description: '',
  });

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/request-form');
      return;
    }
    loadInventory();
  }, [navigate]);

  const loadInventory = () => {
    setInventory(getInventory());
  };

  const handleAdd = () => {
    if (!formData.itemName || !formData.category) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const newItem = addInventoryItem(formData);
    const user = getSession();
    addRecord({
      actionType: 'item_added',
      description: `Added new item: ${newItem.itemName}`,
      userId: user?.id || '',
      userName: user?.username || '',
    });

    loadInventory();
    setIsAddDialogOpen(false);
    resetForm();
    toast({
      title: 'Success',
      description: 'Item added successfully',
    });
  };

  const handleEdit = () => {
    if (!editingItem) return;

    updateInventoryItem(editingItem.id, formData);
    const user = getSession();
    addRecord({
      actionType: 'item_updated',
      description: `Updated item: ${formData.itemName}`,
      userId: user?.id || '',
      userName: user?.username || '',
    });

    loadInventory();
    setIsEditDialogOpen(false);
    setEditingItem(null);
    resetForm();
    toast({
      title: 'Success',
      description: 'Item updated successfully',
    });
  };

  const handleDelete = (item: InventoryItem) => {
    if (confirm(`Are you sure you want to delete ${item.itemName}?`)) {
      deleteInventoryItem(item.id);
      const user = getSession();
      addRecord({
        actionType: 'item_deleted',
        description: `Deleted item: ${item.itemName}`,
        userId: user?.id || '',
        userName: user?.username || '',
      });

      loadInventory();
      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });
    }
  };

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      description: item.description,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      itemName: '',
      category: '',
      quantity: 0,
      unit: '',
      description: '',
    });
  };

  const getStockColor = (quantity: number) => {
    if (quantity < 10) return 'text-destructive';
    if (quantity < 20) return 'text-warning';
    return 'text-success';
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
            <p className="text-muted-foreground">Manage supply items</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="itemName">Item Name *</Label>
                  <Input
                    id="itemName"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="pcs, kg, box"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <Button onClick={handleAdd} className="w-full">Add Item</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {inventory.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No items in inventory</p>
              <p className="text-sm text-muted-foreground mb-4">Add your first item to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventory.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span className="text-foreground">{item.itemName}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Category: {item.category}</p>
                    <p className="text-sm text-muted-foreground">Description: {item.description}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <span className="text-sm font-medium text-muted-foreground">Stock:</span>
                      <span className={`text-xl font-bold ${getStockColor(item.quantity)}`}>
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-itemName">Item Name *</Label>
                <Input
                  id="edit-itemName"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category *</Label>
                <Input
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-quantity">Quantity</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-unit">Unit</Label>
                  <Input
                    id="edit-unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <Button onClick={handleEdit} className="w-full">Update Item</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Inventory;
