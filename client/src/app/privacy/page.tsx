// app/privacy/page.tsx
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, Calendar, Shield, Eye, User, Mail } from 'lucide-react'

export default function PrivacyPage() {
  const sections = [
    {
      title: "Information We Collect",
      content: `We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This includes:
      • Personal information (name, email, phone number)
      • Payment information (processed securely by our payment partners)
      • Shipping and billing addresses
      • Purchase history and preferences`
    },
    {
      title: "How We Use Your Information",
      content: `We use the information we collect to:
      • Process your orders and payments
      • Provide customer support
      • Send you important account-related updates
      • Personalize your shopping experience
      • Improve our services and develop new features
      • Comply with legal obligations`
    },
    {
      title: "Information Sharing",
      content: `We do not sell your personal information. We may share your information with:
      • Service providers who assist in our operations (payment processors, shipping carriers)
      • Legal authorities when required by law
      • Business partners with your explicit consent
      All third parties are required to protect your information appropriately.`
    },
    {
      title: "Data Security",
      content: `We implement appropriate security measures to protect your personal information, including:
      • SSL encryption for all data transmissions
      • Regular security assessments and updates
      • Limited access to personal information
      • Secure payment processing through PCI-compliant partners`
    },
    {
      title: "Your Rights",
      content: `You have the right to:
      • Access and receive a copy of your personal data
      • Correct inaccurate or incomplete data
      • Request deletion of your personal data
      • Object to processing of your personal data
      • Data portability
      • Withdraw consent at any time`
    },
    {
      title: "Cookies and Tracking",
      content: `We use cookies and similar technologies to:
      • Remember your preferences and settings
      • Analyze site traffic and usage patterns
      • Provide personalized content and ads
      • Improve website functionality
      You can control cookies through your browser settings.`
    },
    {
      title: "Data Retention",
      content: `We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. Account information is retained while your account is active and for a reasonable period thereafter.`
    },
    {
      title: "International Transfers",
      content: `Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this privacy policy.`
    },
    {
      title: "Children's Privacy",
      content: `Our services are not directed to individuals under 16. We do not knowingly collect personal information from children under 16. If we become aware of such collection, we will take steps to delete the information.`
    },
    {
      title: "Changes to This Policy",
      content: `We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.`
    },
    {
      title: "Contact Us",
      content: `If you have any questions about this Privacy Policy or our data practices, please contact us at:
      Email: privacy@shopco.com
      Phone: 1-800-SHOPCO-1
      Address: 123 Commerce Street, San Francisco, CA 94105`
    }
  ]

  const dataTypes = [
    { icon: User, type: "Personal Data", examples: "Name, email, phone number" },
    { icon: Mail, type: "Contact Information", examples: "Email, phone, address" },
    { icon: Eye, type: "Usage Data", examples: "Browsing history, preferences" },
    { icon: Shield, type: "Technical Data", examples: "IP address, device information" }
  ]

  return (
    <div className="container py-12 lg:py-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Privacy
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Privacy Policy
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

        {/* Data Types Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {dataTypes.map((item, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-4">
                <item.icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-sm mb-1">{item.type}</h3>
                <p className="text-xs text-muted-foreground">{item.examples}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Privacy Commitment */}
        <Card className="bg-green-50 border-green-200 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800 mb-2">Our Commitment to Your Privacy</h3>
                <p className="text-green-700 text-sm">
                  At ShopCo, we are committed to protecting your privacy and being transparent about how we collect, use, and protect your personal information. This policy explains our practices in clear, straightforward language.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policy Content */}
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    {index + 1}. {section.title}
                  </h2>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Consent Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-blue-900 mb-2">
              Your Privacy Matters
            </h3>
            <p className="text-blue-700 text-sm">
              By using our services, you consent to the collection and use of your information as described in this Privacy Policy. We are committed to protecting your privacy and giving you control over your personal data.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
