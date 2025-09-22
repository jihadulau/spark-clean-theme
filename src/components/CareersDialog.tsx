import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CareersDialogProps {
  children: React.ReactNode;
}

const CareersDialog = ({ children }: CareersDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVisaFields, setShowVisaFields] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission (demo mode)
      setTimeout(() => {
        toast({
          title: "Application Submitted! 🌟",
          description: "Thanks! Your expression of interest is in (Demo mode). We'll review it and reach out when a suitable role pops up.",
        });

        // Reset form
        (e.target as HTMLFormElement).reset();
        setShowVisaFields(false);
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Join our Clean Team ✨
          </DialogTitle>
          <DialogDescription>
            We're always on the lookout for caring, can-do people who love leaving spaces sparkling. 
            Tell us a little about you—your availability, where you can work, and the kind of cleaning you enjoy. 
            It's quick, promise! We read every submission and get in touch when there's a great match.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-full max-h-[65vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input 
                  id="fullName" 
                  name="fullName" 
                  placeholder="e.g., Taylor Nguyen" 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="best email for job updates" 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mobile">Mobile *</Label>
                <Input 
                  id="mobile" 
                  name="mobile" 
                  placeholder="04xx xxx xxx" 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="suburb">Suburb *</Label>
                <Input 
                  id="suburb" 
                  name="suburb" 
                  placeholder="Your suburb (for local shifts)" 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postcode">Postcode *</Label>
                <Input 
                  id="postcode" 
                  name="postcode" 
                  placeholder="4-digit postcode" 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="workType">Preferred Work Type *</Label>
                <Select name="workType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose work type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="rolesOfInterest">Roles of Interest</Label>
              <Input 
                id="rolesOfInterest" 
                name="rolesOfInterest" 
                placeholder="Residential, Commercial, Airbnb, End-of-lease…" 
              />
            </div>

            <div>
              <Label htmlFor="availability">Availability (days/times)</Label>
              <Textarea 
                id="availability" 
                name="availability" 
                placeholder="When can you usually work?" 
                className="min-h-[60px]"
              />
            </div>

            <div>
              <Label htmlFor="workRights">Work Rights in Australia *</Label>
              <Select 
                name="workRights" 
                required 
                onValueChange={(value) => setShowVisaFields(value === "visa")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select work rights status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="citizen">Australian Citizen</SelectItem>
                  <SelectItem value="pr">Permanent Resident</SelectItem>
                  <SelectItem value="visa">Visa with work rights</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showVisaFields && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="visaType">Visa Type</Label>
                  <Input 
                    id="visaType" 
                    name="visaType" 
                    placeholder="e.g., Student (500), Partner (820)…" 
                  />
                </div>
                <div>
                  <Label htmlFor="visaExpiry">Visa Expiry</Label>
                  <Input 
                    id="visaExpiry" 
                    name="visaExpiry" 
                    placeholder="DD/MM/YYYY" 
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="license">Driver's Licence</Label>
                <Select name="license">
                  <SelectTrigger>
                    <SelectValue placeholder="Select licence type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="l">L</SelectItem>
                    <SelectItem value="p">P</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vehicle">Own Reliable Vehicle?</Label>
                <Select name="vehicle">
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="travelDistance">Distance Willing to Travel</Label>
                <Input 
                  id="travelDistance" 
                  name="travelDistance" 
                  placeholder="e.g., up to 20 km" 
                />
              </div>
              <div>
                <Label htmlFor="languages">Languages</Label>
                <Input 
                  id="languages" 
                  name="languages" 
                  placeholder="English, Arabic, Mandarin…" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Earliest Start Date</Label>
                <Input 
                  id="startDate" 
                  name="startDate" 
                  placeholder="DD/MM/YYYY" 
                />
              </div>
              <div>
                <Label htmlFor="desiredHours">Desired Hours per Week</Label>
                <Input 
                  id="desiredHours" 
                  name="desiredHours" 
                  placeholder="e.g., 15–25" 
                />
              </div>
            </div>

            <div>
              <Label htmlFor="experience">Experience Summary</Label>
              <Textarea 
                id="experience" 
                name="experience" 
                placeholder="Years, settings, tasks you're confident with" 
                className="min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="referee1">Referee #1</Label>
              <Textarea 
                id="referee1" 
                name="referee1" 
                placeholder="Name, relationship, phone/email" 
                className="min-h-[60px]"
              />
            </div>

            <div>
              <Label htmlFor="referee2">Referee #2</Label>
              <Textarea 
                id="referee2" 
                name="referee2" 
                placeholder="Name, relationship, phone/email" 
                className="min-h-[60px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="policeCheck">Police Check Status</Label>
                <Select name="policeCheck">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current</SelectItem>
                    <SelectItem value="willing">Willing to obtain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="wwcc">WWCC Status (if relevant)</Label>
                <Select name="wwcc">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current</SelectItem>
                    <SelectItem value="willing">Willing to obtain</SelectItem>
                    <SelectItem value="not-applicable">Not applicable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="serviceAreas">Areas You Can Service</Label>
              <Textarea 
                id="serviceAreas" 
                name="serviceAreas" 
                placeholder="List suburbs/LGAs you can reach" 
                className="min-h-[60px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactPreference">Contact Preference</Label>
                <Select name="contactPreference">
                  <SelectTrigger>
                    <SelectValue placeholder="Preferred contact method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="contactTime">Best Time to Contact</Label>
                <Input 
                  id="contactTime" 
                  name="contactTime" 
                  placeholder="Weekdays 10am–2pm" 
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="capabilities" name="capabilities" required />
                <Label htmlFor="capabilities" className="text-sm">
                  I'm able to perform the physical aspects of cleaning *
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="marketingConsent" name="marketingConsent" />
                <Label htmlFor="marketingConsent" className="text-sm">
                  Yes, keep me posted on roles
                </Label>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              By sharing your details, you agree we can contact you about roles and handle your info according to our Privacy Policy. 
              Thank you for considering us—can't wait to meet you!
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Application
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CareersDialog;