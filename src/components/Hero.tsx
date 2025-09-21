import { Button } from "@/components/ui/button";
import { Phone, CheckCircle, Star } from "lucide-react";
import heroImage from "@/assets/hero-cleaning.jpg";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center cleaning-pattern">
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-cleaning-light px-4 py-2 rounded-full">
                <Star className="w-4 h-4 text-cleaning-blue fill-current" />
                <span className="text-sm font-medium text-cleaning-dark">Trusted by 1000+ clients</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-cleaning-dark leading-tight">
                Making clean 
                <span className="block text-transparent bg-gradient-to-r from-cleaning-blue to-cleaning-cyan bg-clip-text">
                  simple & easy
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg">
                Professional cleaning services for your home and office. 
                Reliable, affordable, and always spotless results guaranteed.
              </p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "100% Satisfaction Guaranteed",
                "Eco-Friendly Products",
                "Licensed & Insured",
                "Flexible Scheduling"
              ].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-cleaning-blue flex-shrink-0" />
                  <span className="text-cleaning-dark font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" className="shadow-medium" asChild>
                <a href="#contact">Get Free Estimate</a>
              </Button>
              
              <Button variant="cleaning-outline" size="xl" asChild>
                <a href="tel:(555)123-2532">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </a>
              </Button>
              
              <Button variant="cleaning-light" size="xl" asChild>
                <a href="#contact">Book Online</a>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-cleaning-light">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cleaning-blue">5.0</div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cleaning-blue">1000+</div>
                  <div className="text-sm text-muted-foreground">Happy Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cleaning-blue">5+</div>
                  <div className="text-sm text-muted-foreground">Years Experience</div>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-scale-in">
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Professional cleaning team at work"
                className="w-full h-auto rounded-2xl shadow-strong"
              />
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 bg-white rounded-lg p-4 shadow-medium animate-bounce-soft">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-semibold">Available Now</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-cleaning-blue text-white rounded-lg p-4 shadow-medium">
                <div className="text-center">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-xs">Emergency Service</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;