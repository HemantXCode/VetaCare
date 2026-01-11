import React, { useState } from 'react';
import { ClipboardList, ChevronRight, Loader2, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

const questions = [
  {
    id: 'sleep',
    question: 'How many hours of sleep do you get on average?',
    options: ['Less than 5 hours', '5-6 hours', '7-8 hours', 'More than 8 hours']
  },
  {
    id: 'exercise',
    question: 'How often do you exercise?',
    options: ['Never', '1-2 times/week', '3-4 times/week', 'Daily']
  },
  {
    id: 'stress',
    question: 'How would you rate your stress level?',
    options: ['Very High', 'High', 'Moderate', 'Low']
  },
  {
    id: 'diet',
    question: 'How would you describe your diet?',
    options: ['Mostly junk food', 'Irregular meals', 'Balanced diet', 'Very healthy']
  },
  {
    id: 'water',
    question: 'How much water do you drink daily?',
    options: ['Less than 4 glasses', '4-6 glasses', '6-8 glasses', 'More than 8 glasses']
  },
  {
    id: 'smoking',
    question: 'Do you smoke?',
    options: ['Yes, regularly', 'Occasionally', 'Quit recently', 'Never']
  },
  {
    id: 'alcohol',
    question: 'How often do you consume alcohol?',
    options: ['Daily', 'Weekly', 'Occasionally', 'Never']
  },
  {
    id: 'chronic',
    question: 'Do you have any chronic conditions?',
    options: ['Yes, multiple', 'Yes, one', 'Not sure', 'No']
  }
];

export default function HealthCheckupCard({ patientId }) {
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnswer = (value) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: value
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      analyzeHealth();
    }
  };

  const analyzeHealth = async () => {
    setAnalyzing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze these health assessment responses and provide a comprehensive health risk analysis:

${Object.entries(answers).map(([key, value]) => {
  const q = questions.find(q => q.id === key);
  return `${q?.question}: ${value}`;
}).join('\n')}

Provide:
1. Overall health risk score (0-100, where 100 is excellent health)
2. Risk level (low/moderate/high/critical)
3. Top 3 areas of concern
4. Top 5 personalized recommendations for improvement`,
        response_json_schema: {
          type: "object",
          properties: {
            risk_score: { type: "number" },
            risk_level: { type: "string" },
            areas_of_concern: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Save to database
      await base44.entities.HealthCheckup.create({
        patient_id: patientId,
        responses: Object.entries(answers).map(([key, value]) => ({
          question: questions.find(q => q.id === key)?.question || key,
          answer: value
        })),
        risk_score: response.risk_score,
        risk_level: response.risk_level,
        recommendations: response.recommendations,
        areas_of_concern: response.areas_of_concern
      });

      setResult(response);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'text-emerald-600 bg-emerald-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const progress = (currentQuestion / questions.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Health Checkup</CardTitle>
            <p className="text-sm text-gray-500">Quick health risk assessment</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {!started && !result && (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6"
            >
              <Activity className="w-16 h-16 mx-auto text-teal-500 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Quick Health Assessment</h3>
              <p className="text-sm text-gray-500 mb-6">
                Answer {questions.length} simple questions to get a personalized health risk analysis
              </p>
              <Button 
                onClick={() => setStarted(true)}
                className="bg-teal-500 hover:bg-teal-600"
              >
                Start Assessment
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {started && !analyzing && !result && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <span className="text-sm font-medium text-teal-600">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-4">
                  {questions[currentQuestion].question}
                </h3>
                <RadioGroup
                  value={answers[questions[currentQuestion].id] || ''}
                  onValueChange={handleAnswer}
                  className="space-y-3"
                >
                  {questions[currentQuestion].options.map((option, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                        answers[questions[currentQuestion].id] === option
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-teal-300'
                      }`}
                    >
                      <RadioGroupItem value={option} id={`option-${idx}`} />
                      <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Button
                onClick={nextQuestion}
                disabled={!answers[questions[currentQuestion].id]}
                className="w-full bg-teal-500 hover:bg-teal-600"
              >
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'Get Results'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {analyzing && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <Loader2 className="w-12 h-12 mx-auto text-teal-500 animate-spin mb-4" />
              <p className="text-gray-600">Analyzing your responses...</p>
            </motion.div>
          )}

          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Score */}
              <div className="text-center py-6 bg-gray-50 rounded-xl">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${result.risk_score * 3.52} 352`}
                      className={getScoreColor(result.risk_score).replace('bg-', 'text-')}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{result.risk_score}</span>
                  </div>
                </div>
                <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${getRiskColor(result.risk_level)}`}>
                  {result.risk_level.charAt(0).toUpperCase() + result.risk_level.slice(1)} Risk
                </span>
              </div>

              {/* Areas of Concern */}
              {result.areas_of_concern?.length > 0 && (
                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span className="font-medium text-orange-900">Areas of Concern</span>
                  </div>
                  <ul className="space-y-2">
                    {result.areas_of_concern.map((area, idx) => (
                      <li key={idx} className="text-sm text-orange-800 flex items-start gap-2">
                        <span className="text-orange-400 mt-1">•</span>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-emerald-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-emerald-900">Recommendations</span>
                </div>
                <ul className="space-y-2">
                  {result.recommendations?.map((rec, idx) => (
                    <li key={idx} className="text-sm text-emerald-800 flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">{idx + 1}.</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStarted(false);
                  setCurrentQuestion(0);
                  setAnswers({});
                  setResult(null);
                }}
              >
                Take Assessment Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}