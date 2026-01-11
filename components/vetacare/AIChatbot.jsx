import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm VetaCare AI Assistant. I can help answer your health-related questions. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are VetaCare AI, a helpful healthcare assistant. Answer the following health question clearly and concisely. Always recommend consulting a doctor for serious concerns.

User Question: ${userMessage}

Provide a helpful, accurate response. If the question is about symptoms, suggest possible causes but emphasize the importance of professional medical consultation.`,
        response_json_schema: {
          type: "object",
          properties: {
            answer: { type: "string" },
            should_see_doctor: { type: "boolean" },
            urgency: { type: "string", enum: ["low", "moderate", "high"] }
          }
        }
      });

      let aiResponse = response.answer;
      if (response.should_see_doctor) {
        aiResponse += "\n\n⚕️ I recommend consulting a healthcare professional for proper evaluation.";
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiResponse,
        urgency: response.urgency
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble processing your request. Please try again or contact our support team."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center text-white hover:shadow-xl hover:shadow-emerald-500/40 transition-all z-50"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">VetaCare AI</h3>
                    <p className="text-xs text-white/80">Health Assistant</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/20"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user' 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-emerald-500 text-white rounded-tr-sm' 
                        : 'bg-gray-100 text-gray-700 rounded-tl-sm'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm">
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Disclaimer */}
            <div className="px-4 py-2 bg-amber-50 border-t border-amber-100">
              <p className="text-xs text-amber-700 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                AI-assisted only. Not a substitute for medical advice.
              </p>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask a health question..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}