import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyPolicyDialogProps {
  children: React.ReactNode;
}

const PrivacyPolicyDialog = ({ children }: PrivacyPolicyDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
          <DialogDescription>
            Last updated: January 2024
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-full max-h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-lg mb-2">1. Information We Collect</h3>
              <p className="mb-3">
                At Cleandigo, we collect information you provide directly to us, such as when you:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Request a cleaning service quote</li>
                <li>Book our services</li>
                <li>Contact us via phone, email, or our website</li>
                <li>Apply for employment with us</li>
                <li>Subscribe to our newsletter or updates</li>
              </ul>
              <p className="mt-3">
                This information may include your name, email address, phone number, home address, 
                service preferences, and payment information.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">2. How We Use Your Information</h3>
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide, maintain, and improve our cleaning services</li>
                <li>Process bookings and payments</li>
                <li>Communicate with you about our services</li>
                <li>Send you service confirmations and updates</li>
                <li>Respond to your comments and questions</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">3. Information Sharing</h3>
              <p className="mb-3">
                We do not sell, trade, or otherwise transfer your personal information to third parties, 
                except in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>With your explicit consent</li>
                <li>To trusted service providers who assist us in operating our business</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">4. Data Security</h3>
              <p>
                We implement appropriate technical and organizational security measures to protect your 
                personal information against unauthorized access, alteration, disclosure, or destruction. 
                However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">5. Your Rights</h3>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access and receive a copy of your personal information</li>
                <li>Rectify inaccurate personal information</li>
                <li>Request deletion of your personal information</li>
                <li>Object to processing of your personal information</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">6. Cookies and Tracking</h3>
              <p>
                Our website may use cookies and similar tracking technologies to enhance your experience. 
                You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">7. Contact Us</h3>
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-2">
                <p><strong>Email:</strong> services@cleandigo.com.au</p>
                <p><strong>Phone:</strong> 0420 331 350</p>
                <p><strong>Address:</strong> Greater Metro Area, Australia</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">8. Changes to This Policy</h3>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes 
                by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyDialog;