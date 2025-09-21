import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Mail, Shield, Sparkles, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const navigation = [
    { name: "Home", href: "#home" },
    { name: "Services", href: "#services" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className="fixed w-full bg-white/95 backdrop-blur-sm shadow-soft z-50 transition-smooth">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center relative shadow-lg">
              <Shield className="w-6 h-6 text-secondary" />
              <Sparkles className="w-3 h-3 text-secondary/80 absolute -top-0.5 -right-0.5" />
              <div className="absolute inset-0 bg-secondary/10 rounded-lg"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-cleaning-dark">Cleandigo</h1>
              <p className="text-sm text-cleaning-blue">Professional Cleaning</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-cleaning-dark hover:text-primary transition-smooth font-medium"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Contact Info & CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to={profile?.role === 'admin' ? '/admin' : '/account'} 
                  className="flex items-center space-x-2 text-cleaning-dark hover:text-primary font-medium"
                >
                  <User className="h-4 w-4" />
                  <span>{profile?.role === 'admin' ? 'Admin' : 'My Account'}</span>
                </Link>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-2 text-sm text-cleaning-dark">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>0420 331 350</span>
                </div>
                <Button variant="outline" asChild className="mr-2">
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button variant="hero" className="px-6 py-2" asChild>
                  <a href="#contact">Get Quote</a>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-cleaning-light transition-smooth"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-cleaning-light animate-fade-in">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-cleaning-dark hover:text-primary transition-smooth font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="flex flex-col space-y-3 pt-4 border-t border-cleaning-light">
                <div className="flex items-center space-x-2 text-sm text-cleaning-dark">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>0420 331 350</span>
                </div>
                <Button variant="hero" className="w-full py-3 rounded-lg" asChild>
                  <a href="#contact">Get Quote</a>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;