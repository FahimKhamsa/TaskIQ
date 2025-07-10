"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bot,
  Zap,
  Shield,
  Smartphone,
  ArrowRight,
  Check,
  Play,
  Star,
  Calendar,
  Mail,
  MapPin,
  Activity,
  MessageSquare,
  Settings,
  BarChart3,
  Users,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/custom/logo";
import { LavaLamp } from "@/components/three/fluid-blob";

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
 * This is a Client Component with interactive features and animations.
 *
 * @returns {JSX.Element} The landing page component.
 */
export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const supabase = createClient();

  // Button click handlers
  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  const handleGetStarted = () => {
    // Redirect to Telegram bot (main product)
    window.open("https://t.me/Task_IQ_bot", "_blank");
  };

  const handleViewDemo = () => {
    // Open demo video or redirect to demo page
    window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
  };

  const handlePlanSelect = (planName: string) => {
    setSelectedPlan(planName);
    setIsLoading(true);
    // Simulate plan selection
    setTimeout(() => {
      setIsLoading(false);
      alert(`Selected ${planName} plan! Redirecting to checkout...`);
    }, 1500);
  };
  return (
    <div className="min-h-screen bg-transparent lg:px-0 sm:px-10">
      {/* Lava Lamp Background */}
      <LavaLamp />

      {/* Header */}
      <header>
        <div className="container mx-auto py-4">
          <div className="flex items-center md:px-20 justify-between tracking-tight mix-blend-exclusion">
            <Logo href="/" className="text-2xl text-black" />
            <Button
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white hover:scale-105 transition-transform duration-200"
              onClick={handleSignIn}
            >
              Sign in with Google
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="py-20 sm:py-32 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 opacity-50">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-2xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>

          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Text and Buttons */}
              <div className="animate-in slide-in-from-left-4 duration-1000">
                <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mix-blend-exclusion text-white">
                  Your AI Assistant for{" "}
                  <span className="text-purple-600 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                    Google Services
                  </span>
                </h1>
                <p
                  className="mt-6 text-xl leading-8 text-gray-400 animate-in slide-in-from-left-4 duration-1000  tracking-tight mix-blend-exclusion"
                  style={{ animationDelay: "200ms" }}
                >
                  Connect your Telegram bot to Gmail, Calendar, Fitness, and
                  Maps. Manage everything with simple commands powered by AI.
                </p>

                <div
                  className="mt-10 flex items-center gap-x-6 animate-in slide-in-from-left-4 duration-1000 tracking-tight mix-blend-exclusion"
                  style={{ animationDelay: "400ms" }}
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white hover:scale-105 transition-all duration-300 group"
                    onClick={handleGetStarted}
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button
                    size="lg"
                    className="bg-gray-700 text-white hover:bg-gray-800 hover:scale-105 transition-all duration-300 group"
                    onClick={handleViewDemo}
                  >
                    <Play className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    View Demo
                  </Button>
                </div>
              </div>

              {/* Right side - Dashboard Demo */}
              <div
                className="animate-in slide-in-from-right-4 duration-1000"
                style={{ animationDelay: "300ms" }}
              >
                <div className="relative w-full mix-blend-exclusion">
                  <div className="aspect-video bg-black backdrop-blur-sm rounded-2xl border-2 border-gray-700 shadow-2xl p-4">
                    <div className="h-full">
                      <div className="bg-black rounded-lg p-3 space-y-3 min-h-[300px]">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white text-sm">
                            Dashboard
                          </h3>
                          <Settings className="h-4 w-4 text-gray-400" />
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-4 gap-1 mb-2">
                          <Card className="bg-black border border-gray-600 shadow-sm">
                            <CardHeader className="pb-1 p-2">
                              <div className="flex items-center justify-between">
                                <CardDescription className="text-xs text-gray-300">
                                  Commands Used
                                </CardDescription>
                                <Activity className="h-2 w-2 text-gray-400" />
                              </div>
                            </CardHeader>
                            <CardContent className="p-2 pt-0">
                              <div className="flex items-baseline space-x-1">
                                <div className="text-sm font-bold text-white">
                                  2,847
                                </div>
                                <span className="text-xs bg-purple-900 text-purple-300 px-1 rounded">
                                  +12%
                                </span>
                              </div>
                              <p className="text-xs text-gray-400">
                                This month
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="bg-black border border-gray-600 shadow-sm">
                            <CardHeader className="pb-1 p-2">
                              <div className="flex items-center justify-between">
                                <CardDescription className="text-xs text-gray-300">
                                  Credits Remaining
                                </CardDescription>
                                <BarChart3 className="h-2 w-2 text-gray-400" />
                              </div>
                            </CardHeader>
                            <CardContent className="p-2 pt-0">
                              <div className="flex items-baseline space-x-1">
                                <div className="text-sm font-bold text-white">
                                  1,250
                                </div>
                                <span className="text-xs bg-gray-600 text-gray-300 px-1 rounded">
                                  62.5%
                                </span>
                              </div>
                              <p className="text-xs text-gray-400">
                                Out of 2,000
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="bg-black border border-gray-600 shadow-sm">
                            <CardHeader className="pb-1 p-2">
                              <div className="flex items-center justify-between">
                                <CardDescription className="text-xs text-gray-300">
                                  Active Integrations
                                </CardDescription>
                                <Users className="h-2 w-2 text-gray-400" />
                              </div>
                            </CardHeader>
                            <CardContent className="p-2 pt-0">
                              <div className="flex items-baseline space-x-1">
                                <div className="text-sm font-bold text-white">
                                  4
                                </div>
                                <span className="text-xs bg-purple-900 text-purple-300 px-1 rounded">
                                  100%
                                </span>
                              </div>
                              <p className="text-xs text-gray-400">
                                All connected
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="bg-black border border-gray-600 shadow-sm">
                            <CardHeader className="pb-1 p-2">
                              <div className="flex items-center justify-between">
                                <CardDescription className="text-xs text-gray-300">
                                  Bot Uptime
                                </CardDescription>
                                <Bot className="h-2 w-2 text-gray-400" />
                              </div>
                            </CardHeader>
                            <CardContent className="p-2 pt-0">
                              <div className="flex items-baseline space-x-1">
                                <div className="text-sm font-bold text-white">
                                  99.9%
                                </div>
                                <span className="text-xs bg-purple-900 text-purple-300 px-1 rounded">
                                  +0.1%
                                </span>
                              </div>
                              <p className="text-xs text-gray-400">
                                Last 30 days
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Bottom Section - Connected Services & Recent Activity */}
                        <div className="grid grid-cols-2 gap-1">
                          {/* Connected Services */}
                          <Card className="bg-black border border-gray-600 shadow-sm">
                            <CardHeader className="pb-1 p-2">
                              <CardTitle className="text-xs text-white">
                                Connected Services
                              </CardTitle>
                              <CardDescription className="text-xs text-gray-300">
                                Your active Google integrations
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="p-2 pt-0">
                              <div className="space-y-1">
                                {[
                                  {
                                    name: "Gmail",
                                    icon: Mail,
                                    lastUsed: "2h ago",
                                    status: "connected",
                                  },
                                  {
                                    name: "Calendar",
                                    icon: Calendar,
                                    lastUsed: "5m ago",
                                    status: "connected",
                                  },
                                  {
                                    name: "Maps",
                                    icon: MapPin,
                                    lastUsed: "1d ago",
                                    status: "connected",
                                  },
                                ].map((integration) => (
                                  <div
                                    key={integration.name}
                                    className="flex items-center justify-between"
                                  >
                                    <div className="flex items-center space-x-1">
                                      <integration.icon className="h-2 w-2 text-gray-400" />
                                      <div>
                                        <p className="text-xs font-medium text-white">
                                          {integration.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                          Last used {integration.lastUsed}
                                        </p>
                                      </div>
                                    </div>
                                    <span className="text-xs bg-purple-900 text-purple-300 px-1 rounded capitalize">
                                      {integration.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Recent Activity */}
                          <Card className="bg-black border border-gray-600 shadow-sm">
                            <CardHeader className="pb-1 p-2">
                              <CardTitle className="text-xs text-white">
                                Recent Activity
                              </CardTitle>
                              <CardDescription className="text-xs text-gray-300">
                                Your latest bot interactions
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="p-2 pt-0">
                              <div className="space-y-1">
                                {[
                                  {
                                    action: "Sent email via Gmail",
                                    time: "2 minutes ago",
                                  },
                                  {
                                    action: "Created calendar event",
                                    time: "1 hour ago",
                                  },
                                  {
                                    action: "Searched location on Maps",
                                    time: "3 hours ago",
                                  },
                                ].map((activity) => (
                                  <div
                                    key={activity.action}
                                    className="flex items-start space-x-1"
                                  >
                                    <div className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-purple-400"></div>
                                    <div>
                                      <p className="text-xs font-medium text-white">
                                        {activity.action}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {activity.time}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Floating elements */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-purple-500 rounded-full animate-ping"></div>
                  <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-purple-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gray-50">
          <div className="w-full px-8 sm:px-12 lg:px-16 xl:px-20">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Powerful features designed to streamline your digital life
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <Card
                  key={feature.title}
                  className="bg-white border-gray-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer animate-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="items-center text-center">
                    <feature.icon className="h-12 w-12 text-purple-600 hover:rotate-12 transition-transform duration-300" />
                    <CardTitle className="text-gray-900 pt-4">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-white">
          <div className="w-full px-8 sm:px-12 lg:px-16 xl:px-20">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Choose the plan that works best for you
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-stretch">
              {pricing.map((plan, index) => (
                <Card
                  key={plan.name}
                  className={`bg-white border-gray-200 shadow-lg relative flex flex-col h-full hover:shadow-xl hover:scale-105 transition-all duration-300 animate-in slide-in-from-bottom-4 ${
                    plan.popular
                      ? "border-purple-500 ring-2 ring-purple-200"
                      : ""
                  } ${
                    selectedPlan === plan.name ? "ring-2 ring-green-200" : ""
                  }`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 animate-bounce">
                      <span className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-1 text-sm font-medium text-white rounded-full flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-gray-900">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <CardDescription className="text-gray-600 pt-2">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-between">
                    <ul className="space-y-3 flex-1">
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={feature}
                          className="flex items-center space-x-3 animate-in slide-in-from-left-2"
                          style={{
                            animationDelay: `${
                              index * 150 + featureIndex * 50
                            }ms`,
                          }}
                        >
                          <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full mt-8 hover:scale-105 transition-all duration-300 ${
                        plan.popular
                          ? "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white"
                          : "bg-[#0f0f0f] text-white hover:bg-[#1a1a1a]"
                      } ${
                        selectedPlan === plan.name
                          ? "bg-green-600 text-white"
                          : ""
                      }`}
                      onClick={() => handlePlanSelect(plan.name)}
                      disabled={isLoading && selectedPlan === plan.name}
                    >
                      {isLoading && selectedPlan === plan.name
                        ? "Processing..."
                        : selectedPlan === plan.name
                        ? "Selected ✓"
                        : "Get Started"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="w-full px-8 sm:px-12 lg:px-16 xl:px-20 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4 tracking-tight mix-blend-exclusion">
              <Logo href="/" className="text-2xl text-black" />
            </div>
            <p className="text-gray-600">
              Streamline your digital life with AI-powered assistance
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
