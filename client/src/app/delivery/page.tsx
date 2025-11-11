// app/delivery/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Truck,
  Clock,
  MapPin,
  Package,
  Shield,
  RefreshCw,
  Globe,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'

export default function DeliveryPage() {
  const shippingMethods = [
    {
      name: "Standard Shipping",
      price: "$4.99",
      deliveryTime: "3-5 business days",
      description: "Our most economical shipping option",
      features: ["Tracking included", "Signature not required", "Insured up to $100"]
    },
    {
      name: "Express Shipping",
      price: "$9.99",
      deliveryTime: "1-2 business days",
      description: "Get your items faster",
      features: ["Priority processing", "Tracking included", "Signature required", "Insured up to $200"]
    },
    {
      name: "Overnight Shipping",
      price: "$19.99",
      deliveryTime: "Next business day",
      description: "For when you need it now",
      features: ["Express processing", "Real-time tracking", "Signature required", "Insured up to $500", "Guanteed delivery"]
    },
    {
      name: "Free Shipping",
      price: "FREE",
      deliveryTime: "5-7 business days",
      description: "On orders over $50",
      features: ["Tracking included", "Standard processing", "No signature required"]
    }
  ]

  const countries = [
    { name: "United States", deliveryTime: "3-7 business days", freeShipping: "$50+" },
    { name: "Canada", deliveryTime: "5-10 business days", freeShipping: "$75+" },
    { name: "United Kingdom", deliveryTime: "7-14 business days", freeShipping: "$100+" },
    { name: "Australia", deliveryTime: "10-15 business days", freeShipping: "$100+" },
    { name: "Germany", deliveryTime: "7-12 business days", freeShipping: "$100+" },
    { name: "Japan", deliveryTime: "8-12 business days", freeShipping: "$100+" }
  ]

  const deliveryFaqs = [
    {
      question: "Do you offer same-day delivery?",
      answer: "Same-day delivery is available in select metropolitan areas for orders placed before 12 PM local time. Additional fees apply."
    },
    {
      question: "Can I change my delivery address after ordering?",
      answer: "Address changes are possible within 1 hour of placing your order. After that, please contact our support team immediately."
    },
    {
      question: "What happens if I'm not home for delivery?",
      answer: "For signature-required deliveries, the carrier will leave a notice and attempt redelivery. You can also pick up from their local facility."
    },
    {
      question: "Do you deliver on weekends?",
      answer: "Yes, we offer Saturday delivery for express and overnight shipping methods. Standard shipping typically doesn't include weekend delivery."
    }
  ]

  return (
    <div className="max-w-7xl mx-auto py-12 lg:py-20">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge variant="outline" className="mb-4">
          Delivery Information
        </Badge>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
          Shipping & Delivery
        </h1>
        <p className="text-xl text-muted-foreground">
          Fast, reliable delivery options to get your orders when you need them.
        </p>
      </div>

      {/* Shipping Methods */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Shipping Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {shippingMethods.map((method, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-lg">{method.name}</CardTitle>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl font-bold">{method.price}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>{method.deliveryTime}</span>
                </div>
                <p className="text-muted-foreground text-sm">{method.description}</p>
                <ul className="space-y-2 text-sm">
                  {method.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Order Processing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Processing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Order Placed</span>
              <Badge variant="secondary">Immediate</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Order Processing</span>
              <Badge variant="secondary">1-2 hours</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Order Shipped</span>
              <Badge variant="secondary">Same day*</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Out for Delivery</span>
              <Badge variant="secondary">Next day</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              *Orders placed before 2 PM EST are shipped same day. Orders after 2 PM ship next business day.
            </p>
          </CardContent>
        </Card>

        {/* International Shipping */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              International Shipping
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {countries.map((country, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{country.name}</p>
                    <p className="text-sm text-muted-foreground">{country.deliveryTime}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Free shipping</p>
                    <p className="text-sm text-muted-foreground">{country.freeShipping}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  International orders may be subject to customs fees and import taxes. These are the responsibility of the recipient.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery FAQs */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Delivery FAQs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {deliveryFaqs.map((faq, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Important Notes */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Shield className="h-6 w-6 text-blue-600 mt-1" />
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900">Important Delivery Information</h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Delivery times are estimates and may vary due to weather, holidays, or carrier delays</li>
                <li>• Signature may be required for high-value orders</li>
                <li>• Please ensure your delivery address is correct before completing your order</li>
                <li>• Contact us immediately if your order is damaged or incorrect</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
