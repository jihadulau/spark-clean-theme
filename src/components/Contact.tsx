import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MapPin, Clock, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: ""
  });
  
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase.functions.invoke('submit-contact', {
        body: formData
      });

      if (error) {
        console.error('Error submitting form:', error);
        toast({
          title: "Error",
          description: "Failed to send your message. Please try again or contact us directly.",
          variant: "destructive",
        });
        return;
      }

      if (data.success) {
        toast({
          title: "Quote Request Sent!",
          description: data.message || "We'll contact you within 24 hours with your custom quote.",
        });
        setFormData({ name: "", email: "", phone: "", service: "", message: "" });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send your message. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Network error:', error);
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Call Us",
      details: "(555) 123-CLEAN",
      subtitle: "24/7 Emergency Service"
    },
    {
      icon: Mail,
      title: "Email Us",
      details: "hello@cleanpro.com",
      subtitle: "Quick response guaranteed"
    },
    {
      icon: MapPin,
      title: "Service Area",
      details: "Greater Metro Area",
      subtitle: "Free estimates available"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: "Mon-Fri: 8AM-6PM",
      subtitle: "Weekend service available"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-cleaning-dark">
            Get Your Free Quote
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready to experience the CleanPro difference? Contact us today for a free, 
            no-obligation estimate tailored to your specific cleaning needs.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="card-gradient border-0 shadow-medium animate-scale-in">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-cleaning-dark flex items-center">
                <Star className="w-6 h-6 text-cleaning-blue mr-2" />
                Request Your Quote
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Your full name"
                      required
                      className="border-cleaning-light focus:ring-cleaning-blue"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="(555) 123-4567"
                      required
                      className="border-cleaning-light focus:ring-cleaning-blue"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="your@email.com"
                    required
                    className="border-cleaning-light focus:ring-cleaning-blue"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service">Service Needed</Label>
                  <Select value={formData.service} onValueChange={(value) => setFormData({...formData, service: value})}>
                    <SelectTrigger className="border-cleaning-light focus:ring-cleaning-blue">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential Cleaning</SelectItem>
                      <SelectItem value="commercial">Commercial Cleaning</SelectItem>
                      <SelectItem value="deep">Deep Cleaning</SelectItem>
                      <SelectItem value="construction">Post-Construction</SelectItem>
                      <SelectItem value="emergency">Emergency Cleaning</SelectItem>
                      <SelectItem value="event">Event Cleaning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Tell us about your cleaning needs, property size, frequency, or any special requirements..."
                    rows={4}
                    className="border-cleaning-light focus:ring-cleaning-blue"
                  />
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="xl"
                  className="w-full shadow-medium"
                >
                  Get My Free Quote
                </Button>
                
                <p className="text-sm text-muted-foreground text-center">
                  * We'll respond within 24 hours with your customized quote
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <Card 
                  key={index} 
                  className="p-6 card-gradient border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-0 space-y-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <info.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-cleaning-dark">{info.title}</h3>
                      <p className="text-lg font-bold text-cleaning-blue">{info.details}</p>
                      <p className="text-sm text-muted-foreground">{info.subtitle}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Why Choose Us */}
            <Card className="p-8 hero-gradient text-white shadow-strong">
              <CardContent className="p-0 space-y-6">
                <h3 className="text-2xl font-bold">Why Choose CleanPro?</h3>
                
                <div className="space-y-4">
                  {[
                    "✨ 100% Satisfaction Guaranteed",
                    "🌿 Eco-Friendly Cleaning Products",
                    "🛡️ Licensed, Bonded & Insured",
                    "⚡ Same-Day Service Available",
                    "💰 Competitive Pricing",
                    "👥 Experienced Professional Team"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-lg">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-white/20">
                  <p className="text-lg font-semibold">
                    🎉 New customers save 20% on first cleaning!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;