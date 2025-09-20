import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Building2, Sparkles, Shield, Clock, Users } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: Home,
      title: "Residential Cleaning",
      description: "Complete home cleaning services including kitchens, bathrooms, bedrooms, and living areas.",
      features: ["Deep cleaning", "Regular maintenance", "Move-in/out cleaning"],
      price: "Starting at $99"
    },
    {
      icon: Building2,
      title: "Commercial Cleaning",
      description: "Professional office and commercial space cleaning for businesses of all sizes.",
      features: ["Office buildings", "Retail spaces", "Medical facilities"],
      price: "Custom pricing"
    },
    {
      icon: Sparkles,
      title: "Deep Cleaning",
      description: "Intensive cleaning service that tackles every corner, perfect for seasonal cleaning.",
      features: ["Detailed sanitization", "Hard-to-reach areas", "Appliance cleaning"],
      price: "Starting at $199"
    },
    {
      icon: Shield,
      title: "Post-Construction",
      description: "Specialized cleaning for newly constructed or renovated properties.",
      features: ["Dust removal", "Paint & debris cleanup", "Final polish"],
      price: "Starting at $299"
    },
    {
      icon: Clock,
      title: "Emergency Cleaning",
      description: "24/7 emergency cleaning services for urgent situations and last-minute needs.",
      features: ["Same-day service", "24/7 availability", "Rapid response"],
      price: "Call for pricing"
    },
    {
      icon: Users,
      title: "Event Cleaning",
      description: "Pre and post-event cleaning services to make your event space pristine.",
      features: ["Pre-event setup", "During event maintenance", "Post-event cleanup"],
      price: "Starting at $149"
    }
  ];

  return (
    <section id="services" className="py-20 bg-cleaning-light">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-cleaning-dark">
            Our Cleaning Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From regular maintenance to deep cleaning, we provide comprehensive cleaning solutions 
            tailored to your specific needs and schedule.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="card-gradient border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-2 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center mb-4">
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-cleaning-dark">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {service.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-cleaning-blue rounded-full"></div>
                      <span className="text-cleaning-dark">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-cleaning-blue">
                      {service.price}
                    </span>
                  </div>
                  
                  <Button className="w-full bg-cleaning-blue hover:bg-cleaning-cyan text-white transition-smooth">
                    Get Quote
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 animate-fade-in">
          <p className="text-lg text-muted-foreground mb-6">
            Need a custom cleaning solution? We're here to help!
          </p>
          <Button variant="hero" size="xl" className="shadow-medium">
            Contact Us for Custom Quote
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Services;