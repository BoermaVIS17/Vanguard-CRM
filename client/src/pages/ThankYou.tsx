import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Calendar,
  FileText,
  Home,
  ArrowLeft,
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function ThankYou() {
  const [, setLocation] = useLocation();
  const [submissionData, setSubmissionData] = useState<{
    name?: string;
    email?: string;
    isPaid?: boolean;
    handsOn?: boolean;
  }>({});

  useEffect(() => {
    // Get submission data from URL params or sessionStorage
    const params = new URLSearchParams(window.location.search);
    const name = params.get("name") || sessionStorage.getItem("submissionName") || "Homeowner";
    const email = params.get("email") || sessionStorage.getItem("submissionEmail") || "";
    const isPaid = params.get("paid") === "true" || sessionStorage.getItem("submissionPaid") === "true";
    const handsOn = params.get("handsOn") === "true" || sessionStorage.getItem("submissionHandsOn") === "true";
    
    setSubmissionData({ name, email, isPaid, handsOn });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container max-w-3xl py-16 px-4">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 border-2 border-primary mb-6 animate-in zoom-in duration-500">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4 animate-in slide-in-from-bottom-4 duration-500">
            Request Received!
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-lg mx-auto animate-in slide-in-from-bottom-4 duration-500 delay-100">
            Thank you{submissionData.name ? `, ${submissionData.name.split(' ')[0]}` : ''}! Your storm documentation report request has been successfully submitted.
          </p>
        </div>

        {/* What Happens Next Card */}
        <Card className="bg-card/80 backdrop-blur-xl border-white/10 mb-8 animate-in slide-in-from-bottom-4 duration-500 delay-200">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-xl font-heading font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              What Happens Next
            </h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center font-mono text-sm text-primary font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white mb-1">Confirmation Email</h3>
                  <p className="text-sm text-muted-foreground">
                    You'll receive a confirmation email at <span className="text-primary">{submissionData.email || "your email"}</span> within the next few minutes.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center font-mono text-sm text-primary font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white mb-1">Scheduling Call</h3>
                  <p className="text-sm text-muted-foreground">
                    One of our team members will contact you within 24 hours to confirm your address and schedule the inspection window.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center font-mono text-sm text-primary font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white mb-1">
                    {submissionData.handsOn ? "Drone + In-Person Inspection" : "Drone Inspection"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {submissionData.handsOn 
                      ? "Our FAA-compliant drone will capture aerial imagery, followed by a hands-on inspection with one of our certified technicians."
                      : "Our FAA-compliant drone will capture high-resolution aerial imagery of your roof. You don't need to be home for this."}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center font-mono text-sm text-primary font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white mb-1">Report Delivery</h3>
                  <p className="text-sm text-muted-foreground">
                    Your comprehensive PDF report will be emailed to you within 48 hours of the inspection, complete with NOAA storm data and our professional assessment.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Info */}
        <Card className="bg-secondary/30 border-white/10 mb-8 animate-in slide-in-from-bottom-4 duration-500 delay-300">
          <CardContent className="p-6">
            <h3 className="font-heading font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Important Information
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Your report is for documentation and maintenance purposes only.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>This service does not file or constitute an insurance claim.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Keep your report on file as documentation of your roof's condition.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="grid md:grid-cols-2 gap-4 mb-8 animate-in slide-in-from-bottom-4 duration-500 delay-400">
          <Card className="bg-card/50 border-white/10">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Questions?</p>
                <p className="text-white font-medium">Contact Us</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-white/10">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                <p className="text-white font-medium">info@nextdoorextroofing.com</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in slide-in-from-bottom-4 duration-500 delay-500">
          <Button 
            variant="outline" 
            onClick={() => setLocation("/")}
            className="border-white/20 hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <Button 
            onClick={() => window.open("https://nextdoorextroofing.com", "_blank")}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Home className="w-4 h-4 mr-2" />
            Visit Our Main Site
          </Button>
        </div>

        {/* Footer Note */}
        <Separator className="my-8 bg-white/10" />
        
        <p className="text-center text-xs text-muted-foreground">
          NextDoor Exterior Solutions • Licensed Contractor CCC-1334600 • Serving Central Florida
        </p>
      </div>
    </div>
  );
}
