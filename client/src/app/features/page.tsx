// app/features/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, ShoppingCart, Shield, Zap, Smartphone, Globe, BarChart, Users } from 'lucide-react'

export default function FeaturesPage() {
  const features = [
    {
      icon: ShoppingCart,
      title: 'Easy Store Setup',
      description: 'Get your store up and running in minutes with our intuitive setup wizard.',
      highlights: ['Drag & drop builder', 'Pre-built templates', 'One-click imports']
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Multiple payment gateways with bank-level security and fraud protection.',
      highlights: ['PCI Compliant', 'SSL Encryption', '3D Secure']
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Blazing fast performance with global CDN and optimized infrastructure.',
      highlights: ['99.9% Uptime', 'Global CDN', 'Auto Scaling']
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Perfect shopping experience on any device with responsive design.',
      highlights: ['Progressive Web App', 'Mobile SDK', 'Push Notifications']
    },
    {
      icon: Globe,
      title: 'Global Ready',
      description: 'Sell to customers worldwide with multi-currency and localization.',
      highlights: ['100+ Currencies', 'Auto Translation', 'Local Payment Methods']
    },
    {
      icon: BarChart,
      title: 'Advanced Analytics',
      description: 'Make data-driven decisions with comprehensive sales and customer insights.',
      highlights: ['Real-time Reports', 'Customer Behavior', 'Sales Funnel']
    }
  ]

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      description: 'Perfect for small businesses',
      features: ['Up to 100 products', 'Basic analytics', 'Email support', '1 staff account']
    },
    {
      name: 'Professional',
      price: '$79',
      period: '/month',
      description: 'Ideal for growing businesses',
      features: ['Unlimited products', 'Advanced analytics', 'Priority support', '5 staff accounts', 'Custom domain']
    },
    {
      name: 'Enterprise',
      price: '$199',
      period: '/month',
      description: 'For large-scale operations',
      features: ['Unlimited everything', 'Dedicated account manager', '24/7 phone support', 'Custom integrations', 'API access']
    }
  ]

  return (
    <div className="max-w-7xl mx-auto py-12 lg:py-20">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge variant="outline" className="mb-4">
          Features
        </Badge>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
          Everything You Need to Succeed Online
        </h1>
        <p className="text-xl text-muted-foreground">
          Powerful features designed to help you build, manage, and grow your online store.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{feature.description}</p>
              <ul className="space-y-2">
                {feature.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pricing Section */}
      <div className="mb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground">
            Choose the plan that works best for your business. All plans include our core features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <Card key={index} className={index === 1 ? 'border-blue-600 shadow-lg relative' : ''}>
              {index === 1 && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={index === 1 ? 'default' : 'outline'}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
        <CardContent className="p-12">
          <Users className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
            Join thousands of successful merchants who trust ShopCo to power their online stores.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white">
              Schedule Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
