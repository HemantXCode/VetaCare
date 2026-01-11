import React, { useState } from 'react';
import { Brain, Upload, Loader2, AlertTriangle, Stethoscope, ShieldCheck, FileImage } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIDiagnosisCard({ patientId }) {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    
    setAnalyzing(true);
    try {
      // Upload image first
      const { file_url } = await base44.integrations.Core.UploadFile({ file: image });
      
      // Analyze with AI
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a medical AI assistant. Analyze this medical/skin image and provide a preliminary assessment. 
        
Important: This is for educational purposes only and should not replace professional medical diagnosis.

Analyze the image and provide:
1. Possible condition or observation
2. Confidence level (low/medium/high)
3. Severity assessment (low/moderate/high/critical)
4. Recommended specialist type to consult
5. Basic precautions or advice

Be helpful but always emphasize the importance of professional medical consultation.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            condition: { type: "string" },
            confidence: { type: "string", enum: ["low", "medium", "high"] },
            severity: { type: "string", enum: ["low", "moderate", "high", "critical"] },
            specialist: { type: "string" },
            advice: { type: "string" },
            precautions: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Save diagnosis to database
      await base44.entities.AIDiagnosis.create({
        patient_id: patientId,
        image_url: file_url,
        condition: analysis.condition,
        confidence: analysis.confidence === 'high' ? 90 : analysis.confidence === 'medium' ? 70 : 50,
        recommended_specialist: analysis.specialist,
        advice: analysis.advice,
        severity: analysis.severity
      });

      setResult(analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      setResult({
        error: true,
        message: "Unable to analyze the image. Please try again."
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const severityColors = {
    low: 'bg-green-100 text-green-700',
    moderate: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700'
  };

  const confidenceColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-emerald-100 text-emerald-700'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-lg">AI Diagnosis</CardTitle>
            <p className="text-sm text-gray-500">Upload an image for AI analysis</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <label className="block cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            disabled={analyzing}
          />
          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
            imagePreview ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
          }`}>
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Selected" 
                  className="max-h-48 mx-auto rounded-lg"
                />
                <Badge className="absolute top-2 right-2 bg-emerald-500">
                  Image Selected
                </Badge>
              </div>
            ) : (
              <>
                <FileImage className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="font-medium text-gray-700">Click to upload an image</p>
                <p className="text-sm text-gray-500 mt-1">Skin conditions, rashes, symptoms, etc.</p>
              </>
            )}
          </div>
        </label>

        {/* Analyze Button */}
        {imagePreview && (
          <Button 
            onClick={analyzeImage}
            disabled={analyzing}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Analyze Image
              </>
            )}
          </Button>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && !result.error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Possible Condition</span>
                  <Badge className={severityColors[result.severity]}>
                    {result.severity} severity
                  </Badge>
                </div>
                <p className="font-semibold text-gray-900">{result.condition}</p>
                
                <div className="flex items-center gap-2">
                  <Badge className={confidenceColors[result.confidence]}>
                    {result.confidence} confidence
                  </Badge>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Recommended Specialist</span>
                </div>
                <p className="text-blue-800">{result.specialist}</p>
              </div>

              <div className="bg-emerald-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-emerald-900">Advice & Precautions</span>
                </div>
                <p className="text-emerald-800 text-sm">{result.advice}</p>
                {result.precautions?.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {result.precautions.map((p, i) => (
                      <li key={i} className="text-sm text-emerald-700 flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disclaimer */}
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-sm">
            <strong>Disclaimer:</strong> AI-assisted analysis only. This is not a medical diagnosis. 
            Always consult a qualified healthcare professional for proper evaluation and treatment.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}