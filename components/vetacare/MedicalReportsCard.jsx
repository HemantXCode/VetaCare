import React, { useState } from 'react';
import { FileText, Upload, X, Check, Eye, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

const reportTypeLabels = {
  blood_test: 'Blood Test',
  xray: 'X-Ray',
  mri: 'MRI',
  ct_scan: 'CT Scan',
  prescription: 'Prescription',
  discharge_summary: 'Discharge Summary',
  other: 'Other'
};

const reportTypeColors = {
  blood_test: 'bg-red-100 text-red-700',
  xray: 'bg-blue-100 text-blue-700',
  mri: 'bg-purple-100 text-purple-700',
  ct_scan: 'bg-orange-100 text-orange-700',
  prescription: 'bg-green-100 text-green-700',
  discharge_summary: 'bg-teal-100 text-teal-700',
  other: 'bg-gray-100 text-gray-700'
};

export default function MedicalReportsCard({ reports, patientId, onReportsChange }) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        const fileExt = file.name.split('.').pop().toLowerCase();
        await base44.entities.MedicalReport.create({
          patient_id: patientId,
          file_name: file.name,
          file_url,
          file_type: fileExt,
          report_type: 'other',
          report_date: new Date().toISOString().split('T')[0]
        });
      }
      onReportsChange();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (reportId) => {
    setDeleting(reportId);
    try {
      await base44.entities.MedicalReport.delete(reportId);
      onReportsChange();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Medical Reports</CardTitle>
              <p className="text-sm text-white/80">{reports.length} documents</p>
            </div>
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
            <Button 
              variant="secondary" 
              size="sm" 
              className="bg-white/20 hover:bg-white/30 text-white border-0"
              disabled={uploading}
              asChild
            >
              <span>
                {uploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload
              </span>
            </Button>
          </label>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {reports.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">No reports uploaded yet</p>
            <p className="text-sm text-gray-400">Upload your medical reports to keep them organized</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reports.map((report) => (
              <div 
                key={report.id} 
                className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    report.file_type === 'pdf' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{report.file_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${reportTypeColors[report.report_type]} text-xs`}>
                        {reportTypeLabels[report.report_type]}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {report.report_date && format(new Date(report.report_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1 text-emerald-600 text-sm">
                    <Check className="w-4 h-4" />
                    <span>Uploaded</span>
                  </div>
                  <a 
                    href={report.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4 text-gray-500" />
                  </a>
                  <button
                    onClick={() => handleDelete(report.id)}
                    disabled={deleting === report.id}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    {deleting === report.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}