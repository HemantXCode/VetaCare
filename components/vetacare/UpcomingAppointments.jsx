import React from 'react';
import { Calendar, Clock, Video, MapPin, User, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, isAfter, parseISO } from 'date-fns';

const doctorImages = {
  'Dr. Sarah Johnson': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
  'Dr. Michael Chen': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150',
  'Dr. Emily Davis': 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150',
  'Dr. James Wilson': 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150',
  'Dr. Lisa Thompson': 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150',
  'Dr. Robert Martinez': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
  'Dr. Jennifer Lee': 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=150',
  'Dr. David Brown': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150',
};

export default function UpcomingAppointments({ appointments }) {
  // Filter for upcoming appointments only
  const upcomingAppointments = appointments
    .filter(apt => {
      const aptDate = parseISO(apt.appointment_date);
      return isAfter(aptDate, new Date()) || format(aptDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    })
    .filter(apt => apt.status === 'confirmed' || apt.status === 'pending')
    .slice(0, 3);

  const statusColors = {
    confirmed: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          Upcoming Appointments
        </CardTitle>
        <Link to={createPageUrl('BookAppointment')}>
          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
            Book New
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-4">No upcoming appointments</p>
            <Link to={createPageUrl('BookAppointment')}>
              <Button variant="outline">
                Book an Appointment
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={doctorImages[appointment.doctor_name]} />
                    <AvatarFallback>
                      {appointment.doctor_name?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {appointment.doctor_name}
                      </h4>
                      <Badge className={statusColors[appointment.status]}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-emerald-600">{appointment.doctor_specialty}</p>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
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
                          <>
                            <Video className="w-4 h-4 text-purple-500" />
                            <span className="text-purple-600">Video</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span className="text-blue-600">In-Person</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {appointments.length > 3 && (
              <Link to={createPageUrl('PatientCorner')} className="block">
                <Button variant="ghost" className="w-full text-emerald-600">
                  View All Appointments
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}