// app/about/page.tsx
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Target, Eye, Heart, Users, Award, Clock } from 'lucide-react'

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: 'Innovation',
      description: 'Constantly pushing boundaries to deliver cutting-edge e-commerce solutions.'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Working together with our clients to achieve their business goals.'
    },
    {
      icon: Heart,
      title: 'Passion',
      description: 'Driven by our love for creating exceptional online shopping experiences.'
    },
    {
      icon: Eye,
      title: 'Transparency',
      description: 'Open and honest communication in everything we do.'
    }
  ]

  const milestones = [
    { year: '2020', event: 'Company Founded' },
    { year: '2021', event: 'First 1000 Merchants' },
    { year: '2022', event: '$100M+ in Sales' },
    { year: '2023', event: 'International Expansion' },
    { year: '2024', event: '10K+ Active Stores' }
  ]

  return (
    <div className=" py-12 lg:py-20 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge variant="outline" className="mb-4">
          About ShopCo
        </Badge>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
          Building the Future of E-commerce
        </h1>
        <p className="text-xl text-muted-foreground">
          We're on a mission to democratize e-commerce by providing powerful,
          accessible tools that help businesses of all sizes succeed online.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        <Card>
          <CardContent className="p-8">
            <Target className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-muted-foreground text-lg">
              To empower entrepreneurs and businesses with the tools they need to
              create successful online stores, regardless of their technical expertise
              or budget constraints.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
            <Eye className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-muted-foreground text-lg">
              A world where anyone with a great product and passion can build a
              thriving online business and reach customers anywhere in the world.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Values */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
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

      {/* Timeline */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200"></div>
          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className="w-1/2 pr-8">
                  <Card className={`${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <CardContent className="p-6">
                      <Badge variant="secondary" className="mb-2">
                        {milestone.year}
                      </Badge>
                      <h3 className="text-xl font-semibold">{milestone.event}</h3>
                    </CardContent>
                  </Card>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-600 border-4 border-white z-10"></div>
                <div className="w-1/2 pl-8"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Stats */}
      <Card className="bg-blue-600 text-white">
        <CardContent className="p-12 text-center">
          <h2 className="text-3xl font-bold mb-8">Join Our Growing Community</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <Award className="h-8 w-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">50+</p>
              <p className="text-blue-100">Team Members</p>
            </div>
            <div>
              <Users className="h-8 w-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">10K+</p>
              <p className="text-blue-100">Happy Merchants</p>
            </div>
            <div>
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-blue-100">Support</p>
            </div>
            <div>
              <Target className="h-8 w-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">15+</p>
              <p className="text-blue-100">Countries</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
