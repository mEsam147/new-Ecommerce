// app/support/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MessageCircle,
  Phone,
  Mail,
  Clock,
  HelpCircle,
  FileText,
  Truck,
  Shield,
  CreditCard,
  RotateCcw,
  User
} from 'lucide-react'

export default function SupportPage() {
  const faqs = [
    {
      question: "How do I track my order?",
      answer: "You can track your order by logging into your account and visiting the 'Orders' section, or by using the tracking number sent to your email."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, and Google Pay."
    },
    {
      question: "How can I return an item?",
      answer: "Items can be returned within 30 days of delivery. Visit the 'Returns' section in your account to initiate a return."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times vary by location."
    },
    {
      question: "How do I change my account information?",
      answer: "You can update your account information by logging in and visiting the 'Account Settings' page."
    },
    {
      question: "What is your refund policy?",
      answer: "Refunds are processed within 5-7 business days after we receive your returned items. The amount will be credited to your original payment method."
    }
  ]

  const supportChannels = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help from our support team",
      availability: "24/7",
      responseTime: "< 2 minutes",
      action: "Start Chat"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our support agents",
      availability: "Mon-Fri, 9AM-6PM EST",
      responseTime: "Immediate",
      action: "Call Now"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      availability: "24/7",
      responseTime: "< 4 hours",
      action: "Send Email"
    },
    {
      icon: HelpCircle,
      title: "Help Center",
      description: "Browse our knowledge base",
      availability: "Always available",
      responseTime: "Instant",
      action: "Browse Articles"
    }
  ]

  const quickLinks = [
    { icon: Truck, title: "Shipping Information", href: "/delivery" },
    { icon: RotateCcw, title: "Returns & Refunds", href: "/returns" },
    { icon: CreditCard, title: "Payment Methods", href: "/payment-methods" },
    { icon: Shield, title: "Privacy & Security", href: "/privacy" },
    { icon: FileText, title: "Terms & Conditions", href: "/terms" },
    { icon: User, title: "Account Help", href: "/account-help" }
  ]

  return (
    <div className="max-w-7xl mx-auto py-12 lg:py-20">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge variant="outline" className="mb-4">
          Support
        </Badge>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
          How Can We Help You?
        </h1>
        <p className="text-xl text-muted-foreground">
          Get answers to your questions and find the support you need.
        </p>
      </div>

      {/* Support Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {supportChannels.map((channel, index) => (
          <Card key={index} className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <channel.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{channel.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{channel.description}</p>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>{channel.availability}</span>
                </div>
                <div className="text-muted-foreground">
                  Avg. response: {channel.responseTime}
                </div>
              </div>
              <Button className="w-full">
                {channel.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <link.icon className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">{link.title}</h3>
                    <Button variant="link" className="p-0 h-auto" asChild>
                      <a href={link.href}>Learn more</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* FAQ Section */}
        <div>
          <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Send us a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                    </label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input id="subject" placeholder="How can we help you?" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Please describe your issue in detail..."
                    rows={5}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
