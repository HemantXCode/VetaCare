import React, { useState } from 'react';
import { Sparkles, Loader2, FileText, AlertTriangle, Pill, Heart, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function AIMedicalSummary({ patient, reports, diagnoses }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const reportInfo = reports.map(r => `${r.report_type}: ${r.file_name} (${r.report_date || 'No date'})`).join('\n');
      const diagnosisInfo = diagnoses.map(d => `${d.condition} - Severity: ${d.severity}, Specialist: ${d.recommended_specialist}`).join('\n');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this patient's medical information and provide a comprehensive but concise summary:

PATIENT INFO:
- Name: ${patient?.name || 'Unknown'}
- Age: ${patient?.age || 'Unknown'} years
- Weight: ${patient?.weight || 'Unknown'} kg
- Blood Type: ${patient?.blood_type || 'Unknown'}
- Known Allergies: ${patient?.allergies || 'None reported'}

MEDICAL REPORTS (${reports.length} total):
${reportInfo || 'No reports uploaded'}

AI DIAGNOSIS HISTORY (${diagnoses.length} total):
${diagnosisInfo || 'No AI diagnoses'}

Provide a structured medical summary with:
1. Key conditions identified (from diagnoses)
2. Current treatments or recommendations
3. Allergy alerts and drug interactions to watch
4. Risk factors based on age, conditions, and history
5. Recommended follow-ups or specialists to consult
6. Overall health status (Good/Fair/Needs Attention/Critical)

Keep it concise and easy to understand for both patients and healthcare providers.`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_status: { type: "string", enum: ["Good", "Fair", "Needs Attention", "Critical"] },
            key_conditions: { type: "array", items: { type: "string" } },
            treatments: { type: "array", items: { type: "string" } },
            allergy_alerts: { type: "array", items: { type: "string" } },
            risk_factors: { type: "array", items: { type: "string" } },
            recommended_followups: { type: "array", items: { type: "string" } },
            summary_text: { type: "string" }
          }
        }
      });

      setSummary(response);
    } catch (error) {
      console.error('Summary generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    'Good': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Fair': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Needs Attention': 'bg-orange-100 text-orange-700 border-orange-200',
    'Critical': 'bg-red-100 text-red-700 border-red-200'
  };

  const statusIcons = {
    'Good': CheckCircle,
    'Fair': AlertTriangle,
    'Needs Attention': ShieldAlert,
    'Critical': ShieldAlert
  };

  if (!summary) {
    return (
      <Card className="border-2 border-dashed border-purple-200 bg-purple-50/30">
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">AI Medical Summary</h3>
          <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
            Generate an AI-powered summary of your medical history, conditions, and health insights
          </p>
          <Button
            onClick={generateSummary}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Summary
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const StatusIcon = statusIcons[summary.overall_status] || CheckCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Medical Summary
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={generateSummary}
              disabled={loading}
              className="text-white hover:bg-white/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Overall Status */}
          <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${statusColors[summary.overall_status]}`}>
            <StatusIcon className="w-6 h-6" />
            <div>
              <p className="text-sm font-medium">Overall Health Status</p>
              <p className="text-lg font-bold">{summary.overall_status}</p>
            </div>
          </div>

          {/* Summary Text */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-700 leading-relaxed">{summary.summary_text}</p>
          </div>

          {/* Key Conditions */}
          {summary.key_conditions?.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                Key Conditions
              </h4>
              <div className="flex flex-wrap gap-2">
                {summary.key_conditions.map((condition, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-red-50 text-red-700">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Treatments */}
          {summary.treatments?.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Pill className="w-4 h-4 text-blue-500" />
                Current Treatments / Recommendations
              </h4>
              <ul className="space-y-2">
                {summary.treatments.map((treatment, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {treatment}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Allergy Alerts */}
          {summary.allergy_alerts?.length > 0 && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <h4 className="font-medium text-amber-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Allergy Alerts
              </h4>
              <ul className="space-y-2">
                {summary.allergy_alerts.map((alert, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-amber-800">
                    <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    {alert}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk Factors */}
          {summary.risk_factors?.length > 0 && (
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <h4 className="font-medium text-orange-900 mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Risk Factors
              </h4>
              <ul className="space-y-2">
                {summary.risk_factors.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-orange-800">
                    <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Follow-ups */}
          {summary.recommended_followups?.length > 0 && (
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <h4 className="font-medium text-emerald-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Recommended Follow-ups
              </h4>
              <ul className="space-y-2">
                {summary.recommended_followups.map((followup, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-emerald-800">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    {followup}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 text-center pt-2 border-t">
            AI-generated summary for informational purposes only. Always consult healthcare professionals for medical decisions.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}