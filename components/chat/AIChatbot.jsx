import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your VitaCare Health Assistant. I can help you understand symptoms, find the right specialist, and guide you to the best care. How can I assist you today?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional healthcare AI assistant for VitaCare Hospital. 
        
User's message: "${userMessage}"

Analyze the user's health concern and provide:
1. A brief acknowledgment of their concern
2. Possible conditions (if symptoms mentioned)
3. Severity assessment (Low/Medium/High/Emergency)
4. Recommended next steps
5. Suggest the right medical specialization to consult

Be empathetic, professional, and helpful. Keep response concise but informative.
Always remind users this is not a medical diagnosis and they should consult a doctor.`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            severity: { type: "string", enum: ["Low", "Medium", "High", "Emergency"] },
            recommended_specialist: { type: "string" },
            should_seek_immediate_care: { type: "boolean" }
          }
        }
      });

      let assistantMessage = response.response;
      
      if (response.severity) {
        const severityColors = {
          Low: "🟢",
          Medium: "🟡",
          High: "🟠",
          Emergency: "🔴"
        };
        assistantMessage += `\n\n**Severity Level:** ${severityColors[response.severity]} ${response.severity}`;
      }
      
      if (response.recommended_specialist) {
        assistantMessage += `\n\n**Recommended Specialist:** ${response.recommended_specialist}`;
      }

      if (response.should_seek_immediate_care) {
        assistantMessage += `\n\n⚠️ **Please seek immediate medical attention.**`;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble processing your request right now. Please try again or contact our helpline at 1800-123-4567 for immediate assistance." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg shadow-teal-500/30 flex items-center justify-center ${isOpen ? 'hidden' : ''}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px]">
          <Sparkles className="w-3 h-3" />
        </span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Health Assistant</h3>
                  <p className="text-teal-100 text-xs flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Online • AI Powered
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 px-4 py-2 text-xs text-amber-800 flex items-center gap-2 border-b border-amber-100">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>This is not a medical diagnosis. Please consult a certified doctor.</span>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-slate-100' 
                        : 'bg-teal-100'
                    }`}>
                      {message.role === 'user' 
                        ? <User className="w-4 h-4 text-slate-600" />
                        : <Bot className="w-4 h-4 text-teal-600" />
                      }
                    </div>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      message.role === 'user'
                        ? 'bg-teal-600 text-white rounded-tr-sm'
                        : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                    }`}>
                      {message.role === 'user' ? (
                        <p className="text-sm">{message.content}</p>
                      ) : (
                        <div className="text-sm prose prose-sm prose-slate max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Describe your symptoms..."
                  className="flex-1 bg-white border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
              <p className="text-[10px] text-slate-400 mt-2 text-center">
                Powered by AI • For emergencies, call 1800-123-4567
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}