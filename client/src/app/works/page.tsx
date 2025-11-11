// app/works/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowUpRight, ShoppingBag, Users, TrendingUp, Star } from 'lucide-react'

export default function WorksPage() {
  const caseStudies = [
    {
      category: 'Fashion',
      title: 'Boutique Fashion Store',
      description: 'Transformed a local boutique into a global fashion destination.',
      results: ['300% revenue growth', '50+ countries reached', '4.9 star rating'],
      image: '/api/placeholder/400/300'
    },
    {
      category: 'Electronics',
      title: 'Tech Gadgets Shop',
      description: 'Scaled an electronics store to handle 10,000+ daily visitors.',
      results: ['5x sales increase', '99.9% uptime', '2s load time'],
      image: '/api/placeholder/400/300'
    },
    {
      category: 'Food & Beverage',
      title: 'Artisan Coffee Roaster',
      description: 'Helped a local roaster expand nationwide with subscription model.',
      results: ['200% subscriber growth', 'National distribution', 'Auto-replenishment'],
      image: '/api/placeholder/400/300'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      company: 'Fashion Boutique',
      role: 'Store Owner',
      content: 'ShopCo transformed our business. We went from local to global in just 6 months!',
      rating: 5
    },
    {
      name: 'Mike Chen',
      company: 'TechGadgets',
      role: 'CEO',
      content: 'The scalability and performance are incredible. We handle Black Friday traffic with ease.',
      rating: 5
    },
    {
      name: 'Emily Davis',
      company: 'Brew & Co',
      role: 'Founder',
      content: 'The subscription features helped us build a loyal customer base and predictable revenue.',
      rating: 5
    }
  ]

  const stats = [
    { icon: ShoppingBag, value: '10K+', label: 'Stores Powered' },
    { icon: Users, value: '1M+', label: 'Happy Customers' },
    { icon: TrendingUp, value: '$1B+', label: 'Sales Processed' },
    { icon: Star, value: '4.9/5', label: 'Customer Rating' }
  ]

  return (
    <div className="max-w-7xl mx-auto py-12 lg:py-20">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge variant="outline" className="mb-4">
          Our Work
        </Badge>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
          Success Stories That Inspire
        </h1>
        <p className="text-xl text-muted-foreground">
          Discover how businesses of all sizes are achieving remarkable results with ShopCo.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="p-6">
              <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Case Studies */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Case Studies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all">
              <CardHeader className="p-0">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                  <ShoppingBag className="h-16 w-16 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Badge variant="secondary" className="mb-3">
                  {study.category}
                </Badge>
                <CardTitle className="text-xl mb-3 group-hover:text-blue-600 transition-colors">
                  {study.title}
                </CardTitle>
                <p className="text-muted-foreground mb-4">{study.description}</p>
                <ul className="space-y-2 mb-4">
                  {study.results.map((result, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      {result}
                    </li>
                  ))}
                </ul>
                <Button variant="ghost" className="w-full group-hover:bg-blue-50">
                  View Case Study
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white text-center">
        <CardContent className="p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Write Your Success Story?</h2>
          <p className="text-green-100 text-lg mb-6 max-w-2xl mx-auto">
            Join the thousands of businesses that trust ShopCo to power their online success.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white">
              View All Case Studies
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
