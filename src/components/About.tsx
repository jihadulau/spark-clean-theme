import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Users, Shield, Clock } from "lucide-react";

const About = () => {
  const stats = [
    { icon: Users, number: "1000+", label: "Happy Clients" },
    { icon: Award, number: "1+", label: "Years Experience" },
    { icon: Shield, number: "100%", label: "Satisfaction Rate" },
    { icon: Clock, number: "24/7", label: "Emergency Service" }
  ];

  const values = [
    {
      title: "Quality First",
      description: "We never compromise on quality. Every cleaning job is performed to the highest standards."
    },
    {
      title: "Eco-Friendly",
      description: "We use environmentally safe products that are effective yet gentle on your space."
    },
    {
      title: "Reliable Team",
      description: "Our trained professionals are licensed, insured, and committed to excellence."
    },
    {
      title: "Flexible Scheduling",
      description: "We work around your schedule with convenient booking and flexible timing."
    }
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <Badge className="bg-cleaning-light text-cleaning-blue px-4 py-2">
                About Cleandigo
              </Badge>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-cleaning-dark">
                Your Trusted Cleaning Partner
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                At Cleandigo, we believe that a clean environment is essential for health, 
                productivity, and peace of mind. Since 2024, we've been providing top-quality
                cleaning services to homes and businesses throughout the area.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our team of experienced professionals uses the latest cleaning techniques 
                and eco-friendly products to ensure your space is not just clean, but 
                truly spotless. We're committed to exceeding your expectations with 
                every service.
              </p>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <div 
                  key={index} 
                  className="space-y-2 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <h3 className="font-semibold text-cleaning-dark">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-6 animate-scale-in">
            {stats.map((stat, index) => (
              <Card 
                key={index} 
                className="text-center p-6 card-gradient border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <CardContent className="space-y-4 p-0">
                  <div className="w-12 h-12 mx-auto bg-primary rounded-full flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div>
                    <div className="text-3xl font-bold text-cleaning-blue mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission Statement */}
        <div className="mt-20 text-center animate-fade-in">
          <div className="max-w-4xl mx-auto bg-cleaning-light rounded-2xl p-8 lg:p-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-cleaning-dark mb-6">
              Our Mission
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              "To provide exceptional cleaning services that transform spaces and improve lives. 
              We're dedicated to creating healthier, more beautiful environments for our clients 
              while maintaining the highest standards of professionalism, reliability, and care."
            </p>
            
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-cleaning-blue rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-cleaning-dark">Licensed & Insured</div>
                  <div className="text-sm text-muted-foreground">Fully certified professionals</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;