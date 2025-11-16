import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getRecords, Record } from '@/lib/store';
import { isAdmin } from '@/lib/auth';
import { Download, History } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Records = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('all');

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/request-form');
      return;
    }
    setRecords(getRecords());
  }, [navigate]);

  const months = [
    { value: 'all', label: 'All Records' },
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' },
  ];

  const filteredRecords = selectedMonth === 'all'
    ? records
    : records.filter(r => new Date(r.createdAt).getMonth() === parseInt(selectedMonth));

  const generatePDF = () => {
    const doc = new jsPDF();
    const monthLabel = months.find(m => m.value === selectedMonth)?.label || 'All';
    
    // Title
    doc.setFontSize(20);
    doc.text('Salmoskie Inventory System', 14, 20);
    
    doc.setFontSize(14);
    doc.text(`Activity Records - ${monthLabel}`, 14, 30);
    
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 38);

    // Table
    const tableData = filteredRecords.map(record => [
      new Date(record.createdAt).toLocaleString(),
      record.actionType.replace(/_/g, ' ').toUpperCase(),
      record.description,
      record.userName,
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['Date/Time', 'Action Type', 'Description', 'User']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 144, 180] },
      styles: { fontSize: 8 },
    });

    const fileName = `Salmoskie_Records_${monthLabel}_${new Date().getFullYear()}.pdf`;
    doc.save(fileName);

    toast({
      title: 'PDF Generated',
      description: 'Monthly report has been downloaded',
    });
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'request_approved':
        return 'text-success';
      case 'request_rejected':
        return 'text-destructive';
      case 'item_added':
        return 'text-primary';
      case 'item_deleted':
        return 'text-warning';
      default:
        return 'text-foreground';
    }
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Activity Records</h1>
            <p className="text-muted-foreground">View all system activities</p>
          </div>
          <div className="flex gap-4 items-center">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={generatePDF} disabled={filteredRecords.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Generate PDF
            </Button>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <History className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No records found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`font-medium text-sm ${getActionColor(record.actionType)}`}>
                          {record.actionType.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(record.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-foreground">{record.description}</p>
                      <p className="text-sm text-muted-foreground mt-1">by {record.userName}</p>
                    </div>
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

export default Records;
