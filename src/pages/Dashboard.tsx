import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getInventory, getRequests, getRecords, InventoryItem } from '@/lib/store';
import { isAdmin } from '@/lib/auth';
import { Package, AlertTriangle, ClipboardList, Activity } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [showLowStockAlert, setShowLowStockAlert] = useState(false);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/request-form');
      return;
    }

    const inventory = getInventory();
    const lowStock = inventory.filter(item => item.quantity < 10);
    setLowStockItems(lowStock);
    
    if (lowStock.length > 0) {
      setShowLowStockAlert(true);
    }
  }, [navigate]);

  const inventory = getInventory();
  const requests = getRequests();
  const records = getRecords();
  const pendingRequests = requests.filter(r => r.status === 'pending');

  const handleNextAlert = () => {
    if (currentAlertIndex < lowStockItems.length - 1) {
      setCurrentAlertIndex(currentAlertIndex + 1);
    } else {
      setShowLowStockAlert(false);
      setCurrentAlertIndex(0);
    }
  };

  const stats = [
    {
      title: 'Total Supplies',
      value: inventory.length,
      icon: Package,
      color: 'text-primary',
    },
    {
      title: 'Pending Requests',
      value: pendingRequests.length,
      icon: ClipboardList,
      color: 'text-warning',
    },
    {
      title: 'Low Stock Items',
      value: lowStockItems.length,
      icon: AlertTriangle,
      color: 'text-destructive',
    },
    {
      title: 'Recent Activities',
      value: records.slice(0, 10).length,
      icon: Activity,
      color: 'text-accent',
    },
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of inventory system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alert</CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockItems.length === 0 ? (
                <p className="text-muted-foreground">All items have sufficient stock</p>
              ) : (
                <div className="space-y-2">
                  {lowStockItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                      <div>
                        <p className="font-medium text-foreground">{item.itemName}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <span className="text-destructive font-bold">{item.quantity} {item.unit}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <p className="text-muted-foreground">No recent activities</p>
              ) : (
                <div className="space-y-2">
                  {records.slice(0, 5).map((record) => (
                    <div key={record.id} className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-foreground">{record.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        by {record.userName} • {new Date(record.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert Modal */}
        <Dialog open={showLowStockAlert} onOpenChange={setShowLowStockAlert}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alert
              </DialogTitle>
              <DialogDescription>
                Item {currentAlertIndex + 1} of {lowStockItems.length}
              </DialogDescription>
            </DialogHeader>
            {lowStockItems[currentAlertIndex] && (
              <div className="space-y-4">
                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <h3 className="font-bold text-lg text-foreground mb-2">
                    {lowStockItems[currentAlertIndex].itemName}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    Category: {lowStockItems[currentAlertIndex].category}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Description: {lowStockItems[currentAlertIndex].description}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-destructive/20">
                    <span className="text-sm font-medium text-muted-foreground">Current Stock:</span>
                    <span className="text-xl font-bold text-destructive">
                      {lowStockItems[currentAlertIndex].quantity} {lowStockItems[currentAlertIndex].unit}
                    </span>
                  </div>
                </div>
                <Button onClick={handleNextAlert} className="w-full">
                  {currentAlertIndex < lowStockItems.length - 1 ? 'Next Item' : 'Close'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Dashboard;
