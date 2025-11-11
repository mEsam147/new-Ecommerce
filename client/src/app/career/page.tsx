// app/career/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, DollarSign, Users, Heart, Zap, Globe, Award } from 'lucide-react'

export default function CareerPage() {
  const openPositions = [
    {
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      type: 'Full-time',
      location: 'Remote',
      salary: '$120k - $150k'
    },
    {
      title: 'Product Designer',
      department: 'Design',
      type: 'Full-time',
      location: 'San Francisco, CA',
      salary: '$100k - $130k'
    },
    {
      title: 'DevOps Engineer',
      department: 'Engineering',
      type: 'Full-time',
      location: 'Remote',
      salary: '$130k - $160k'
    },
    {
      title: 'Growth Marketing Manager',
      department: 'Marketing',
      type: 'Full-time',
      location: 'New York, NY',
      salary: '$90k - $120k'
    },
    {
      title: 'Customer Success Manager',
      department: 'Support',
      type: 'Full-time',
      location: 'Remote',
      salary: '$70k - $90k'
    },
    {
      title: 'Backend Engineer',
      department: 'Engineering',
      type: 'Full-time',
      location: 'Austin, TX',
      salary: '$110k - $140k'
    }
  ]

  const benefits = [
    {
      icon: DollarSign,
      title: 'Competitive Salary',
      description: 'We offer competitive compensation packages including equity'
    },
    {
      icon: Clock,
      title: 'Flexible Hours',
      description: 'Work when you\'re most productive with our flexible schedule policy'
    },
    {
      icon: MapPin,
      title: 'Remote Friendly',
      description: 'Work from anywhere with our distributed team culture'
    },
    {
      icon: Users,
      title: 'Team Events',
      description: 'Regular team building activities and annual company retreats'
    },
    {
      icon: Heart,
      title: 'Health & Wellness',
      description: 'Comprehensive health, dental, and vision insurance'
    },
    {
      icon: Zap,
      title: 'Learning Budget',
      description: 'Annual budget for conferences, courses, and professional development'
    }
  ]

  const values = [
    {
      icon: Users,
      title: 'Collaboration',
      description: 'We believe in the power of working together'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We constantly push boundaries and challenge the status quo'
    },
    {
      icon: Heart,
      title: 'Empathy',
      description: 'We care deeply about our customers and each other'
    },
    {
      icon: Globe,
      title: 'Impact',
      description: 'We focus on work that makes a real difference'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto py-12 lg:py-20">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge variant="outline" className="mb-4">
          Join Our Team
        </Badge>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
          Build the Future of E-commerce With Us
        </h1>
        <p className="text-xl text-muted-foreground">
          We're looking for passionate people to join our mission of empowering businesses worldwide.
        </p>
      </div>

      {/* Culture & Values */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Our Culture</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <value.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why Join ShopCo?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index}>
              <CardHeader>
                <benefit.icon className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle className="text-lg">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Open Positions */}
      <div className="mb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Open Positions</h2>
          <p className="text-muted-foreground">
            Check out our current openings and find the perfect role for you.
          </p>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {openPositions.map((position, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{position.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{position.department}</Badge>
                      <Badge variant="outline">{position.type}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {position.location}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        {position.salary}
                      </div>
                    </div>
                  </div>
                  <Button>Apply Now</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Hiring Process */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Our Hiring Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { step: '1', title: 'Application', description: 'Submit your application and resume' },
            { step: '2', title: 'Screening', description: 'Initial phone call with our team' },
            { step: '3', title: 'Interviews', description: 'Meet the team and complete technical assessments' },
            { step: '4', title: 'Offer', description: 'Receive your offer and join the team!' }
          ].map((stage, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {stage.step}
                </div>
                <h3 className="font-semibold mb-2">{stage.title}</h3>
                <p className="text-sm text-muted-foreground">{stage.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center">
        <CardContent className="p-12">
          <Award className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Don't See the Perfect Role?</h2>
          <p className="text-purple-100 text-lg mb-6 max-w-2xl mx-auto">
            We're always looking for talented people. Send us your resume and we'll contact you when a matching position opens up.
          </p>
          <Button size="lg" variant="secondary">
            Send General Application
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
