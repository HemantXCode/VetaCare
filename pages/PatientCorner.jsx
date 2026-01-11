import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User, FileText, Brain, Activity, Edit2, Save, X, Loader2, Calendar, Weight, Droplet, Phone, AlertTriangle, Clock, Video, MapPin, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO, isAfter } from 'date-fns';
import EmergencyBar from '../components/vetacare/EmergencyBar';
import Navbar from '../components/vetacare/Navbar';
import AIChatbot from '../components/vetacare/AIChatbot';
import AIMedicalSummary from '../components/vetacare/AIMedicalSummary';

const reportTypeLabels = {
  blood_test: 'Blood Test',
  xray: 'X-Ray',
  mri: 'MRI',
  ct_scan: 'CT Scan',
  prescription: 'Prescription',
  discharge_summary: 'Discharge Summary',
  other: 'Other'
};

export default function PatientCorner() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl('PatientCorner'));
        return;
      }

      const user = await base44.auth.me();
      const patients = await base44.entities.Patient.filter({ user_id: user.email });
      
      if (patients.length === 0) {
        navigate(createPageUrl('Onboarding'));
        return;
      }

      setPatient(patients[0]);
      setEditData(patients[0]);
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const { data: reports = [] } = useQuery({
    queryKey: ['reports', patient?.id],
    queryFn: () => base44.entities.MedicalReport.filter({ patient_id: patient.id }, '-created_date'),
    enabled: !!patient?.id
  });

  const { data: diagnoses = [] } = useQuery({
    queryKey: ['diagnoses', patient?.id],
    queryFn: () => base44.entities.AIDiagnosis.filter({ patient_id: patient.id }, '-created_date'),
    enabled: !!patient?.id
  });

  const { data: checkups = [] } = useQuery({
    queryKey: ['checkups', patient?.id],
    queryFn: () => base44.entities.HealthCheckup.filter({ patient_id: patient.id }, '-created_date'),
    enabled: !!patient?.id
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', patient?.id],
    queryFn: () => base44.entities.Appointment.filter({ patient_id: patient.id }, '-appointment_date'),
    enabled: !!patient?.id
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.Patient.update(patient.id, {
        name: editData.name,
        age: parseInt(editData.age),
        weight: parseFloat(editData.weight),
        blood_type: editData.blood_type,
        allergies: editData.allergies,
        emergency_contact: editData.emergency_contact
      });
      setPatient({ ...patient, ...editData });
      setEditing(false);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmergencyBar />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card & AI Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* AI Medical Summary */}
            <AIMedicalSummary 
              patient={patient} 
              reports={reports} 
              diagnoses={diagnoses} 
            />

            <Card>
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile
                  </CardTitle>
                  {!editing ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-white hover:bg-white/20"
                      onClick={() => setEditing(true)}
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-white hover:bg-white/20"
                        onClick={() => {
                          setEditing(false);
                          setEditData(patient);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {!editing ? (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto flex items-center justify-center mb-3">
                        <span className="text-3xl font-bold text-emerald-600">
                          {patient?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold">{patient?.name}</h2>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Age</p>
                          <p className="font-medium">{patient?.age} years</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Weight className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Weight</p>
                          <p className="font-medium">{patient?.weight} kg</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Droplet className="w-5 h-5 text-red-400" />
                        <div>
                          <p className="text-xs text-gray-500">Blood Type</p>
                          <p className="font-medium">{patient?.blood_type || 'Not specified'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-xs text-gray-500">Allergies</p>
                          <p className="font-medium">{patient?.allergies || 'None'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Emergency Contact</p>
                          <p className="font-medium">{patient?.emergency_contact || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={editData.name || ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Age</Label>
                        <Input
                          type="number"
                          value={editData.age || ''}
                          onChange={(e) => setEditData({ ...editData, age: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Weight (kg)</Label>
                        <Input
                          type="number"
                          value={editData.weight || ''}
                          onChange={(e) => setEditData({ ...editData, weight: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Blood Type</Label>
                      <Select
                        value={editData.blood_type || ''}
                        onValueChange={(value) => setEditData({ ...editData, blood_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Allergies</Label>
                      <Input
                        value={editData.allergies || ''}
                        onChange={(e) => setEditData({ ...editData, allergies: e.target.value })}
                        placeholder="e.g., Penicillin, Peanuts"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Emergency Contact</Label>
                      <Input
                        value={editData.emergency_contact || ''}
                        onChange={(e) => setEditData({ ...editData, emergency_contact: e.target.value })}
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Records Section */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="appointments">
              <TabsList className="mb-4">
                <TabsTrigger value="appointments" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Appointments ({appointments.length})
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Reports ({reports.length})
                </TabsTrigger>
                <TabsTrigger value="diagnoses" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI Diagnoses ({diagnoses.length})
                </TabsTrigger>
                <TabsTrigger value="checkups" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Checkups ({checkups.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="appointments">
                <Card>
                  <CardHeader>
                    <CardTitle>All Appointments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {appointments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No appointments yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {appointments.map((appointment) => {
                          const isPast = !isAfter(parseISO(appointment.appointment_date), new Date());
                          return (
                            <div 
                              key={appointment.id}
                              className={`p-4 rounded-lg border ${isPast ? 'bg-gray-50 border-gray-200' : 'bg-emerald-50 border-emerald-200'}`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <p className="font-semibold">{appointment.doctor_name}</p>
                                  <p className="text-sm text-emerald-600">{appointment.doctor_specialty}</p>
                                </div>
                                <Badge className={`
                                  ${appointment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : ''}
                                  ${appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' : ''}
                                  ${appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                                  ${appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                                `}>
                                  {appointment.status}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {format(parseISO(appointment.appointment_date), 'MMM d, yyyy')}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {appointment.appointment_time}
                                </div>
                                <div className="flex items-center gap-1">
                                  {appointment.appointment_type === 'video' ? (
                                    <Video className="w-4 h-4 text-purple-500" />
                                  ) : (
                                    <MapPin className="w-4 h-4 text-blue-500" />
                                  )}
                                  {appointment.appointment_type === 'video' ? 'Video Call' : 'In-Person'}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  {appointment.hospital}
                                </div>
                              </div>
                              {appointment.symptoms && (
                                <p className="text-sm text-gray-500 mt-2 pt-2 border-t">
                                  Reason: {appointment.symptoms}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports">
                <Card>
                  <CardHeader>
                    <CardTitle>Medical Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reports.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No medical reports uploaded yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {reports.map((report) => (
                          <div 
                            key={report.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                report.file_type === 'pdf' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                              }`}>
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium">{report.file_name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {reportTypeLabels[report.report_type]}
                                  </Badge>
                                  <span className="text-xs text-gray-400">
                                    {report.report_date && format(new Date(report.report_date), 'MMM d, yyyy')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <a
                              href={report.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                            >
                              View
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="diagnoses">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Diagnoses History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {diagnoses.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No AI diagnoses yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {diagnoses.map((diagnosis) => (
                          <div 
                            key={diagnosis.id}
                            className="p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-medium">{diagnosis.condition}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                  Specialist: {diagnosis.recommended_specialist}
                                </p>
                              </div>
                              <Badge className={`
                                ${diagnosis.severity === 'low' ? 'bg-green-100 text-green-700' : ''}
                                ${diagnosis.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' : ''}
                                ${diagnosis.severity === 'high' ? 'bg-orange-100 text-orange-700' : ''}
                                ${diagnosis.severity === 'critical' ? 'bg-red-100 text-red-700' : ''}
                              `}>
                                {diagnosis.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{diagnosis.advice}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {format(new Date(diagnosis.created_date), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="checkups">
                <Card>
                  <CardHeader>
                    <CardTitle>Health Checkup History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {checkups.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No health checkups completed yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {checkups.map((checkup) => (
                          <div 
                            key={checkup.id}
                            className="p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                                  checkup.risk_score >= 80 ? 'bg-emerald-100 text-emerald-600' :
                                  checkup.risk_score >= 60 ? 'bg-yellow-100 text-yellow-600' :
                                  checkup.risk_score >= 40 ? 'bg-orange-100 text-orange-600' :
                                  'bg-red-100 text-red-600'
                                }`}>
                                  {checkup.risk_score}
                                </div>
                                <div>
                                  <p className="font-medium">Health Score</p>
                                  <p className="text-sm text-gray-500">
                                    {format(new Date(checkup.created_date), 'MMM d, yyyy')}
                                  </p>
                                </div>
                              </div>
                              <Badge className={`
                                ${checkup.risk_level === 'low' ? 'bg-green-100 text-green-700' : ''}
                                ${checkup.risk_level === 'moderate' ? 'bg-yellow-100 text-yellow-700' : ''}
                                ${checkup.risk_level === 'high' ? 'bg-orange-100 text-orange-700' : ''}
                                ${checkup.risk_level === 'critical' ? 'bg-red-100 text-red-700' : ''}
                              `}>
                                {checkup.risk_level} risk
                              </Badge>
                            </div>
                            {checkup.recommendations?.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs text-gray-500 mb-2">Recommendations:</p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {checkup.recommendations.slice(0, 3).map((rec, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <span className="text-emerald-500">•</span>
                                      {rec}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <AIChatbot />
    </div>
  );
}