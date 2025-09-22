import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AuthGuard } from '@/components/AuthGuard';
import { supabase } from '@/integrations/supabase/client';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const { signIn, user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        toast({
          title: "Reset failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reset email sent",
          description: "Check your email for password reset instructions.",
        });
        setResetMode(false);
        setResetEmail('');
      }
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/50 px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center space-x-2 text-2xl font-bold text-primary">
              <div className="relative">
                <Shield className="h-8 w-8" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-primary/60" />
              </div>
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Cleandigo
              </span>
            </Link>
            <p className="mt-2 text-muted-foreground">
              Sign in to your account
            </p>
          </div>

            <Card>
              <CardHeader>
                <CardTitle>{resetMode ? 'Reset Password' : 'Sign In'}</CardTitle>
                <CardDescription>
                  {resetMode 
                    ? 'Enter your email to receive reset instructions'
                    : 'Enter your email and password to access your account'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={resetMode ? handlePasswordReset : handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={resetMode ? resetEmail : email}
                      onChange={(e) => resetMode ? setResetEmail(e.target.value) : setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                    />
                  </div>
                  {!resetMode && (
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                      />
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading 
                      ? (resetMode ? "Sending reset email..." : "Signing in...") 
                      : (resetMode ? "Send Reset Email" : "Sign In")
                    }
                  </Button>
                </form>

                <div className="mt-4 text-center space-y-2">
                  <Button
                    variant="link"
                    onClick={() => {
                      setResetMode(!resetMode);
                      setResetEmail('');
                      setEmail('');
                      setPassword('');
                    }}
                    className="text-sm"
                  >
                    {resetMode ? 'Back to Sign In' : 'Forgot Password?'}
                  </Button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-primary hover:underline font-medium">
                      Sign up
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </AuthGuard>
  );
};

export default SignIn;