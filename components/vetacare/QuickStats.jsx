import React from 'react';
import { FileText, Brain, Activity, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function QuickStats({ reports, diagnoses, checkups }) {
  const stats = [
    {
      label: 'Medical Reports',
      value: reports?.length || 0,
      icon: FileText,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'AI Diagnoses',
      value: diagnoses?.length || 0,
      icon: Brain,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Health Checkups',
      value: checkups?.length || 0,
      icon: Activity,
      color: 'bg-teal-500',
      bgColor: 'bg-teal-50'
    },
    {
      label: 'Days Active',
      value: '14',
      icon: Calendar,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}