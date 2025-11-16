import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getInventory, addRequest, addRecord } from '@/lib/store';
import { getSession } from '@/lib/auth';
import { ClipboardList } from 'lucide-react';

const RequestForm = () => {
  const { toast } = useToast();
  const [inventory, setInventory] = useState(getInventory());
  const [formData, setFormData] = useState({
    requesterName: '',
    department: '',
    itemId: '',
    quantityRequested: 0,
    purpose: '',
  });

  useEffect(() => {
    setInventory(getInventory());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.requesterName || !formData.department || !formData.itemId || formData.quantityRequested <= 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const selectedItem = inventory.find(i => i.id === formData.itemId);
    if (!selectedItem) return;

    if (formData.quantityRequested > selectedItem.quantity) {
      toast({
        title: 'Error',
        description: 'Requested quantity exceeds available stock',
        variant: 'destructive',
      });
      return;
    }

    addRequest({
      ...formData,
      itemName: selectedItem.itemName,
    });

    const user = getSession();
    addRecord({
      actionType: 'request_submitted',
      description: `Request submitted: ${formData.quantityRequested} ${selectedItem.unit} of ${selectedItem.itemName}`,
      userId: user?.id || '',
      userName: user?.username || '',
    });

    toast({
      title: 'Success',
      description: 'Request submitted successfully',
    });

    setFormData({
      requesterName: '',
      department: '',
      itemId: '',
      quantityRequested: 0,
      purpose: '',
    });
  };

  const selectedItem = inventory.find(i => i.id === formData.itemId);

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Request Form</h1>
          <p className="text-muted-foreground">Submit a new supplies request</p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              New Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="requesterName">Requester Name *</Label>
                <Input
                  id="requesterName"
                  value={formData.requesterName}
                  onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="item">Select Item *</Label>
                <Select
                  value={formData.itemId}
                  onValueChange={(value) => setFormData({ ...formData, itemId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventory.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.itemName} ({item.quantity} {item.unit} available)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedItem && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Category:</span> {selectedItem.category}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Available:</span> {selectedItem.quantity} {selectedItem.unit}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Description:</span> {selectedItem.description}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="quantity">Quantity Requested *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedItem?.quantity || undefined}
                  value={formData.quantityRequested}
                  onChange={(e) => setFormData({ ...formData, quantityRequested: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="purpose">Purpose *</Label>
                <Textarea
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="Explain the purpose of this request"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RequestForm;
