import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getRequests, updateRequestStatus, Request, addRecord } from '@/lib/store';
import { isAdmin, getSession } from '@/lib/auth';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const Requests = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/request-form');
      return;
    }
    loadRequests();
  }, [navigate]);

  const loadRequests = () => {
    setRequests(getRequests().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const handleApprove = (request: Request) => {
    updateRequestStatus(request.id, 'approved');
    const user = getSession();
    addRecord({
      actionType: 'request_approved',
      description: `Approved request: ${request.quantityRequested} of ${request.itemName} for ${request.requesterName}`,
      userId: user?.id || '',
      userName: user?.username || '',
    });

    loadRequests();
    toast({
      title: 'Request Approved',
      description: 'Inventory has been automatically deducted',
    });
  };

  const handleReject = (request: Request) => {
    updateRequestStatus(request.id, 'rejected');
    const user = getSession();
    addRecord({
      actionType: 'request_rejected',
      description: `Rejected request: ${request.quantityRequested} of ${request.itemName} for ${request.requesterName}`,
      userId: user?.id || '',
      userName: user?.username || '',
    });

    loadRequests();
    toast({
      title: 'Request Rejected',
      description: 'No changes made to inventory',
      variant: 'destructive',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-success/10 text-success border-success"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.status === filter);

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Requests Management</h1>
          <p className="text-muted-foreground">Review and manage supply requests</p>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All ({requests.length})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            Pending ({requests.filter(r => r.status === 'pending').length})
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilter('approved')}
          >
            Approved ({requests.filter(r => r.status === 'approved').length})
          </Button>
          <Button
            variant={filter === 'rejected' ? 'default' : 'outline'}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({requests.filter(r => r.status === 'rejected').length})
          </Button>
        </div>

        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Clock className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No requests found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-foreground">{request.itemName}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Requester</p>
                          <p className="font-medium text-foreground">{request.requesterName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Department</p>
                          <p className="font-medium text-foreground">{request.department}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quantity</p>
                          <p className="font-medium text-foreground">{request.quantityRequested}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium text-foreground">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-muted-foreground text-sm">Purpose</p>
                        <p className="text-foreground">{request.purpose}</p>
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          className="bg-success/10 text-success border-success hover:bg-success hover:text-success-foreground"
                          onClick={() => handleApprove(request)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-destructive/10 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleReject(request)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Requests;
