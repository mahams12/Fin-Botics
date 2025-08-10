import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Bot, Calculator, FileText, TrendingUp, Shield, Users, CheckCircle } from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: <Bot className="w-8 h-8 text-primary-600" />,
      title: "AI-Powered Assistant",
      description: "Get instant answers to tax questions and expense categorization help from our intelligent CPA bot."
    },
    {
      icon: <Calculator className="w-8 h-8 text-primary-600" />,
      title: "Smart Expense Tracking",
      description: "Automatically categorize and track your business expenses with OCR receipt scanning."
    },
    {
      icon: <FileText className="w-8 h-8 text-primary-600" />,
      title: "Tax-Ready Reports",
      description: "Generate comprehensive reports that are ready for tax filing and compliance."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-primary-600" />,
      title: "Financial Analytics",
      description: "Visualize your spending patterns and identify tax-saving opportunities."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: "Secure & Compliant",
      description: "Bank-level security with full compliance to accounting standards and regulations."
    },
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: "CPA Collaboration",
      description: "Share data securely with your accountant and collaborate on tax preparation."
    }
  ];

  const benefits = [
    "Save hours on expense categorization",
    "Maximize tax deductions with AI insights",
    "Never miss important tax deadlines",
    "Reduce accounting costs by 60%",
    "Get real-time financial health reports",
    "Streamline collaboration with your CPA"
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Small Business Owner",
      content: "This AI CPA bot has revolutionized how I manage my business expenses. What used to take me hours now takes minutes!",
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Freelance Consultant",
      content: "The tax estimation feature is incredibly accurate. I can plan my quarterly payments with confidence.",
      avatar: "MC"
    },
    {
      name: "Lisa Rodriguez",
      role: "Restaurant Owner",
      content: "The receipt scanning is a game-changer. I just snap a photo and everything is categorized automatically.",
      avatar: "LR"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container-custom">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-2">
              <Bot className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">CPA AI Bot</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/login" 
                className="btn btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="heading-responsive font-bold text-gray-900 mb-6">
              AI-Powered CPA Assistant for{' '}
              <span className="text-gradient">Smart Businesses</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Automate your expense tracking, get instant tax advice, and generate professional reports 
              with our intelligent CPA bot. Save time and maximize deductions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link 
                to="/login" 
                className="btn btn-primary btn-lg w-full sm:w-auto"
              >
                Start Free Trial
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
              <button className="btn btn-outline btn-lg w-full sm:w-auto">
                Watch Demo
              </button>
            </div>
            
            {/* Hero Image Placeholder */}
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-hard p-8 border border-gray-200">
                <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl h-80 flex items-center justify-center">
                  <div className="text-center">
                    <Bot className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                    <p className="text-lg text-gray-600">Interactive Demo Coming Soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Tax Season
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed to make tax preparation effortless and accurate.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="card card-hover p-6 text-center"
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Our AI CPA Bot?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of businesses who have transformed their accounting workflow 
                with intelligent automation and expert AI guidance.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-hard p-8">
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl h-80 flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <p className="text-lg text-gray-600">Financial Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Business Owners
            </h2>
            <p className="text-xl text-gray-600">
              See what our users are saying about their experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-6">
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary-600">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Accounting?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Start your free trial today and experience the future of expense management 
              and tax preparation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/login" 
                className="btn bg-white text-primary-600 hover:bg-gray-50 btn-lg w-full sm:w-auto"
              >
                Start Free Trial
              </Link>
              <button className="btn border-white text-white hover:bg-primary-700 btn-lg w-full sm:w-auto">
                Schedule Demo
              </button>
            </div>
            <p className="text-primary-200 text-sm mt-4">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Bot className="w-6 h-6 text-primary-400" />
                <span className="text-xl font-bold text-white">CPA AI Bot</span>
              </div>
              <p className="text-gray-400">
                Intelligent accounting automation for modern businesses.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-8 text-center">
            <p className="text-gray-400">
              © 2024 CPA AI Bot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;