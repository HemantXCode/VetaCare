import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Camera, FileImage, Loader2, AlertTriangle, 
  CheckCircle, Stethoscope, Shield, ArrowRight, X, 
  RefreshCw, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

export default function ScanDisease() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  // Mock AI Analysis - generates realistic demo results
  const generateMockAnalysis = () => {
    const mockResults = [
      {
        image_type: "Skin Condition - Dermatological Image",
        possible_conditions: ["Eczema", "Dermatitis", "Allergic Reaction"],
        severity: "Mild",
        precautions: [
          "Keep the affected area clean and dry",
          "Avoid scratching or rubbing the area",
          "Use hypoallergenic moisturizers",
          "Avoid potential allergens and irritants",
          "Monitor for any changes or worsening"
        ],
        recommended_specialist: "Dermatology",
        analysis_summary: "The image shows signs consistent with a mild inflammatory skin condition. The affected area displays redness and possible irritation. This appears to be an early-stage condition that should respond well to topical treatment.",
        confidence_level: "Medium"
      },
      {
        image_type: "Wound or Injury Assessment",
        possible_conditions: ["Minor Abrasion", "Superficial Wound", "Skin Laceration"],
        severity: "Mild",
        precautions: [
          "Clean the wound with antiseptic solution",
          "Keep the area covered with sterile dressing",
          "Watch for signs of infection (redness, swelling, pus)",
          "Change dressing daily",
          "Seek immediate care if bleeding doesn't stop"
        ],
        recommended_specialist: "General Surgery",
        analysis_summary: "The image shows what appears to be a superficial wound or minor injury. The wound appears relatively clean with minimal tissue damage. Proper wound care and monitoring for infection are recommended.",
        confidence_level: "High"
      },
      {
        image_type: "Eye Condition or Irritation",
        possible_conditions: ["Conjunctivitis", "Eye Irritation", "Dry Eye"],
        severity: "Moderate",
        precautions: [
          "Avoid rubbing your eyes",
          "Use artificial tears or lubricating drops",
          "Practice good hand hygiene",
          "Avoid sharing towels or personal items",
          "Remove contact lenses if worn"
        ],
        recommended_specialist: "Ophthalmology",
        analysis_summary: "The image suggests possible eye irritation or inflammation. The condition may require prescription eye drops or medication. It's important to have this evaluated by an eye specialist to prevent complications.",
        confidence_level: "Medium"
      },
      {
        image_type: "Rash or Skin Inflammation",
        possible_conditions: ["Contact Dermatitis", "Heat Rash", "Viral Rash"],
        severity: "Moderate",
        precautions: [
          "Avoid hot showers or baths",
          "Wear loose, breathable clothing",
          "Apply cool compresses to affected areas",
          "Take antihistamines if itching is severe",
          "Avoid known triggers or allergens"
        ],
        recommended_specialist: "Dermatology",
        analysis_summary: "The image shows a widespread rash pattern that may be caused by various factors including allergies, infections, or environmental triggers. Medical evaluation is recommended to determine the underlying cause and appropriate treatment.",
        confidence_level: "Medium"
      },
      {
        image_type: "Joint or Musculoskeletal Issue",
        possible_conditions: ["Swelling", "Inflammation", "Minor Trauma"],
        severity: "Mild",
        precautions: [
          "Apply ice to reduce swelling (20 minutes, several times daily)",
          "Elevate the affected area when resting",
          "Avoid putting weight or strain on the area",
          "Use compression bandage if recommended",
          "Take over-the-counter pain relief as needed"
        ],
        recommended_specialist: "Orthopaedics",
        analysis_summary: "The image indicates possible swelling or inflammation in the joint area. This could be due to minor trauma, overuse, or inflammatory conditions. Rest and conservative management are recommended initially.",
        confidence_level: "Medium"
      }
    ];

    // Return a random mock result
    return mockResults[Math.floor(Math.random() * mockResults.length)];
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Simulate API delay for realistic demo (1.5-2.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      // Generate mock analysis
      const analysis = generateMockAnalysis();
      setResult(analysis);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze the image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  const severityColors = {
    'Mild': 'bg-green-100 text-green-700',
    'Moderate': 'bg-amber-100 text-amber-700',
    'Severe': 'bg-red-100 text-red-700',
    'Cannot Determine': 'bg-slate-100 text-slate-700'
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-700 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Camera className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              AI Health Scan
            </h1>
            <p className="text-purple-100 text-lg max-w-2xl mx-auto">
              Upload an image of a skin condition or medical report for AI-powered preliminary analysis
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-800">Important Disclaimer</p>
              <p className="text-amber-700">
                This AI-powered scan provides preliminary analysis only and is NOT a medical diagnosis. 
                Always consult a certified healthcare professional for proper diagnosis and treatment.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-teal-600" />
                  Upload Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!previewUrl ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-teal-500 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('fileInput').click()}
                  >
                    <FileImage className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium mb-1">Drop your image here</p>
                    <p className="text-sm text-slate-400">or click to browse</p>
                    <p className="text-xs text-slate-400 mt-4">Supports: JPG, PNG, WEBP</p>
                    <input
                      id="fileInput"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full rounded-xl object-cover max-h-64"
                    />
                    <button
                      onClick={resetAnalysis}
                      className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-100"
                    >
                      <X className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                )}

                {previewUrl && !result && (
                  <Button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full mt-4 bg-teal-600 hover:bg-teal-700"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        Analyze Image
                      </>
                    )}
                  </Button>
                )}

                {error && (
                  <div className="mt-4 p-4 bg-red-50 rounded-xl text-red-700 text-sm">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-teal-600" />
                  Analysis Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {!result ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-12"
                    >
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500">
                        Upload an image to get AI-powered health analysis
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {/* Image Type */}
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Image Type</p>
                        <p className="font-medium text-slate-800">{result.image_type}</p>
                      </div>

                      {/* Severity */}
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Severity Level</p>
                        <Badge className={severityColors[result.severity]}>
                          {result.severity}
                        </Badge>
                      </div>

                      {/* Possible Conditions */}
                      {result.possible_conditions?.length > 0 && (
                        <div>
                          <p className="text-sm text-slate-500 mb-2">Possible Conditions</p>
                          <div className="flex flex-wrap gap-2">
                            {result.possible_conditions.map((cond, i) => (
                              <Badge key={i} variant="secondary">{cond}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Summary */}
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Analysis Summary</p>
                        <p className="text-sm text-slate-700">{result.analysis_summary}</p>
                      </div>

                      {/* Precautions */}
                      {result.precautions?.length > 0 && (
                        <div>
                          <p className="text-sm text-slate-500 mb-2">Recommended Precautions</p>
                          <ul className="space-y-2">
                            {result.precautions.map((precaution, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                                <span className="text-slate-600">{precaution}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommended Specialist */}
                      <div className="pt-4 border-t">
                        <p className="text-sm text-slate-500 mb-2">Recommended Specialist</p>
                        <div className="flex items-center justify-between bg-teal-50 p-4 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                              <Stethoscope className="w-5 h-5 text-teal-600" />
                            </div>
                            <span className="font-medium text-teal-800">
                              {result.recommended_specialist}
                            </span>
                          </div>
                          <Link to={`${createPageUrl('Doctors')}?speciality=${result.recommended_specialist}`}>
                            <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                              Find Doctor
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <Button 
                          variant="outline" 
                          onClick={resetAnalysis}
                          className="flex-1"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          New Scan
                        </Button>
                        <Link to={createPageUrl('BookAppointment')} className="flex-1">
                          <Button className="w-full bg-teal-600 hover:bg-teal-700">
                            Book Consultation
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Skin Conditions</h3>
                <p className="text-sm text-slate-600">
                  Upload images of rashes, moles, acne, or any skin concerns for analysis
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileImage className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Medical Reports</h3>
                <p className="text-sm text-slate-600">
                  Get help understanding your lab reports, X-rays, or scan results
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Secure & Private</h3>
                <p className="text-sm text-slate-600">
                  Your images are encrypted and deleted after analysis
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}