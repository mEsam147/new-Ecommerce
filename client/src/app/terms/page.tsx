// app/terms/page.tsx
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, Calendar, AlertCircle } from 'lucide-react'

export default function TermsPage() {
  const sections = [
    {
      title: "Acceptance of Terms",
      content: `By accessing and using ShopCo's services, you accept and agree to be bound by the terms and provision of this agreement.`
    },
    {
      title: "Use License",
      content: `Permission is granted to temporarily use ShopCo's services for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.`
    },
    {
      title: "Account Registration",
      content: `You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your account and password.`
    },
    {
      title: "Products and Services",
      content: `All products are subject to availability. We reserve the right to discontinue any products at any time. Prices are subject to change without notice.`
    },
    {
      title: "Payment Terms",
      content: `All payments are processed securely. By providing a payment method, you represent that you are authorized to use the payment method.`
    },
    {
      title: "Shipping and Delivery",
      content: `Delivery times are estimates and not guaranteed. Risk of loss passes to you upon delivery. You are responsible for any customs duties or taxes.`
    },
    {
      title: "Returns and Refunds",
      content: `Returns are accepted within 30 days of delivery. Items must be unused and in original packaging. Refunds will be processed to the original payment method.`
    },
    {
      title: "Intellectual Property",
      content: `All content included on this site, such as text, graphics, logos, images, and software, is the property of ShopCo and protected by copyright laws.`
    },
    {
      title: "User Conduct",
      content: `You agree not to use the service for any unlawful purpose or to solicit others to perform or participate in any unlawful acts.`
    },
    {
      title: "Termination",
      content: `We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms and Conditions.`
    },
    {
      title: "Limitation of Liability",
      content: `In no event shall ShopCo, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.`
    },
    {
      title: "Governing Law",
      content: `These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions.`
    },
    {
      title: "Changes to Terms",
      content: `We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of material changes.`
    },
    {
      title: "Contact Information",
      content: `Questions about these Terms should be sent to us at legal@shopco.com.`
    }
  ]

  return (
    <div className="max-w-7xl mx-auto py-12 lg:py-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Legal
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Terms & Conditions
          </h1>
          <div className="flex items-center justify-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Last updated: December 1, 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Effective: January 1, 2024</span>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <Card className="bg-yellow-50 border-yellow-200 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">Important Legal Notice</h3>
                <p className="text-yellow-700 text-sm">
                  Please read these terms carefully before using our services. These terms contain important information regarding your legal rights, remedies, and obligations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms Content */}
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    {index + 1}. {section.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Acceptance Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-blue-900 mb-2">
              By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </h3>
            <p className="text-blue-700 text-sm">
              If you do not agree with any part of these terms, you must not use our services.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
