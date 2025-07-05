import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bot, Zap, Shield, Smartphone, ArrowRight, Check } from "lucide-react";

// Static data for the features section.
const features = [
  {
    icon: Bot,
    title: "AI-Powered Assistant",
    description:
      "Connect your Telegram bot to access Google services with natural language commands.",
  },
  {
    icon: Zap,
    title: "Instant Integration",
    description:
      "Seamlessly connect Gmail, Calendar, Fitness, and Maps services in seconds.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Enterprise-grade security with OAuth authentication and encrypted data.",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description:
      "Access all features directly from Telegram on any device, anywhere.",
  },
];

// Static data for the pricing section.
const pricing = [
  {
    name: "Starter",
    price: "$9",
    description: "Perfect for personal use",
    features: [
      "100 AI requests per month",
      "Basic integrations",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    description: "For power users",
    features: [
      "1,000 AI requests per month",
      "All integrations",
      "Priority support",
      "Advanced analytics",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    description: "For teams and businesses",
    features: [
      "Unlimited AI requests",
      "Custom integrations",
      "24/7 support",
      "Team management",
      "Custom branding",
    ],
    popular: false,
  },
];

/**
 * The main landing page for the TaskIQ application.
 * This is a Server Component, rendered on the server for optimal performance.
 *
 * @returns {JSX.Element} The landing page component.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">TaskIQ</span>
            </div>
            <Button className="bg-gradient-primary">Sign in with Google</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="py-20 sm:py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-4xl">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                Your AI Assistant for{" "}
                <span className="text-primary"> Google Services</span>
              </h1>
              <p className="mt-6 text-xl leading-8 text-muted-foreground">
                Connect your Telegram bot to Gmail, Calendar, Fitness, and Maps.
                Manage everything with simple commands powered by AI.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button size="lg" className="bg-gradient-primary">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">
                  View Demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-card/20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Everything you need
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Powerful features designed to streamline your digital life
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="bg-gradient-card border-border shadow-card"
                >
                  <CardHeader className="items-center text-center">
                    <feature.icon className="h-12 w-12 text-primary" />
                    <CardTitle className="text-foreground pt-4">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Choose the plan that works best for you
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
              {pricing.map((plan) => (
                <Card
                  key={plan.name}
                  className={`bg-gradient-card border-border shadow-card relative flex flex-col ${
                    plan.popular ? "border-primary" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-primary px-4 py-1 text-sm font-medium text-primary-foreground rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-foreground">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <CardDescription className="text-muted-foreground pt-2">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center space-x-3"
                        >
                          <Check className="h-4 w-4 flex-shrink-0 text-success" />
                          <span className="text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full mt-8 ${
                        plan.popular ? "bg-gradient-primary" : ""
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Bot className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">TaskIQ</span>
            </div>
            <p className="text-muted-foreground">
              Streamline your digital life with AI-powered assistance
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
