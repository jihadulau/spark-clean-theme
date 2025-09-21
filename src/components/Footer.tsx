import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import PrivacyPolicyDialog from "./PrivacyPolicyDialog";
import TermsOfServiceDialog from "./TermsOfServiceDialog";
import CareersDialog from "./CareersDialog";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" }
  ];

  const quickLinks = [
    { name: "Home", href: "#home" },
    { name: "Services", href: "#services" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
    { name: "Get Quote", href: "#contact" }
  ];

  const services = [
    "Residential Cleaning",
    "Commercial Cleaning", 
    "Deep Cleaning",
    "Post-Construction",
    "Emergency Service",
    "Event Cleaning"
  ];

  return (
    <footer className="bg-cleaning-dark text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 bg-secondary rounded-md"></div>
              </div>
              <div>
                <h2 className="text-xl font-bold">Cleandigo</h2>
                <p className="text-sm text-gray-300">Professional Cleaning</p>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed">
              Your trusted cleaning partner since 2024. We provide exceptional 
              cleaning services with a commitment to quality, reliability, and 
              customer satisfaction.
            </p>

            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-cleaning-blue rounded-full flex items-center justify-center hover:bg-cleaning-cyan transition-smooth"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-cleaning-cyan transition-smooth"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Our Services</h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <span className="text-gray-300">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-cleaning-cyan mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">0420 331 350</p>
                  <p className="text-sm text-gray-300">24/7 Emergency Service</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-cleaning-cyan mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">services@cleandigo.com.au</p>
                  <p className="text-sm text-gray-300">Quick response guaranteed</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-cleaning-cyan mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Greater Metro Area</p>
                  <p className="text-sm text-gray-300">Serving all neighborhoods</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-cleaning-blue/20 rounded-lg">
              <p className="text-sm font-semibold text-cleaning-cyan">
                🎉 New Customer Special
              </p>
              <p className="text-sm text-gray-300 mt-1">
                20% off your first cleaning service!
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-gray-300">
              © {currentYear} Cleandigo. All rights reserved. Licensed & Insured.
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-300">
              <PrivacyPolicyDialog>
                <button className="hover:text-cleaning-cyan transition-smooth">
                  Privacy Policy
                </button>
              </PrivacyPolicyDialog>
              <TermsOfServiceDialog>
                <button className="hover:text-cleaning-cyan transition-smooth">
                  Terms of Service
                </button>
              </TermsOfServiceDialog>
              <CareersDialog>
                <button className="hover:text-cleaning-cyan transition-smooth">
                  Careers
                </button>
              </CareersDialog>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              Professional cleaning services • Licensed & Bonded • Eco-Friendly Products • 100% Satisfaction Guaranteed
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;