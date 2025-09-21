import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsOfServiceDialogProps {
  children: React.ReactNode;
}

const TermsOfServiceDialog = ({ children }: TermsOfServiceDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogDescription>
            Last updated: January 2024
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-full max-h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-lg mb-2">1. Acceptance of Terms</h3>
              <p>
                By using Cleandigo's services, you agree to these Terms of Service. If you do not agree 
                to these terms, please do not use our services. We reserve the right to modify these 
                terms at any time with reasonable notice.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">2. Service Description</h3>
              <p className="mb-3">
                Cleandigo provides professional cleaning services including:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Residential cleaning services</li>
                <li>Commercial cleaning services</li>
                <li>Deep cleaning and spring cleaning</li>
                <li>Post-construction cleanup</li>
                <li>Emergency cleaning services</li>
                <li>Event cleaning services</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">3. Booking and Payment</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Booking:</h4>
                  <p>All bookings must be confirmed in advance. We reserve the right to decline service requests.</p>
                </div>
                <div>
                  <h4 className="font-medium">Payment:</h4>
                  <p>Payment is due upon completion of services unless other arrangements have been made. We accept cash, bank transfer, and electronic payments.</p>
                </div>
                <div>
                  <h4 className="font-medium">Cancellation:</h4>
                  <p>Cancellations must be made at least 24 hours in advance. Last-minute cancellations may incur a fee.</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">4. Client Responsibilities</h3>
              <p className="mb-3">Clients agree to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide accurate information about the property and cleaning requirements</li>
                <li>Ensure safe access to the property</li>
                <li>Secure or remove valuable or fragile items</li>
                <li>Provide necessary utilities (water, electricity)</li>
                <li>Inform us of any hazardous materials or conditions</li>
                <li>Treat our staff with respect and professionalism</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">5. Our Responsibilities</h3>
              <p className="mb-3">Cleandigo commits to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide professional, reliable cleaning services</li>
                <li>Use eco-friendly cleaning products where possible</li>
                <li>Carry appropriate insurance coverage</li>
                <li>Respect client privacy and property</li>
                <li>Arrive punctually for scheduled appointments</li>
                <li>Address any service concerns promptly</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">6. Liability and Insurance</h3>
              <p>
                Cleandigo is fully insured and bonded. We are liable for damages directly caused by our 
                negligence during service provision. Our liability is limited to the cost of the cleaning 
                service. We are not responsible for pre-existing damage, wear and tear, or damage to 
                items not properly secured.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">7. Quality Guarantee</h3>
              <p>
                We stand behind our work with a 100% satisfaction guarantee. If you're not completely 
                satisfied with our service, please contact us within 24 hours, and we'll return to 
                address any issues at no additional charge.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">8. Privacy and Confidentiality</h3>
              <p>
                We respect your privacy and maintain strict confidentiality regarding your property 
                and personal information. Please refer to our Privacy Policy for detailed information 
                about data handling.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">9. Dispute Resolution</h3>
              <p>
                Any disputes will be resolved through good faith negotiation. If resolution cannot be 
                reached, disputes will be handled according to Australian consumer protection laws.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">10. Contact Information</h3>
              <p>
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="mt-2">
                <p><strong>Email:</strong> services@cleandigo.com.au</p>
                <p><strong>Phone:</strong> 0420 331 350</p>
                <p><strong>Service Area:</strong> Greater Metro Area, Australia</p>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsOfServiceDialog;