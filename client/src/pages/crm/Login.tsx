import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock } from "lucide-react";

export default function CRMLogin() {
  const handleLogin = () => {
    // Redirect to OAuth login
    window.location.href = "/api/auth/login?redirect=/crm";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/40 border-white/10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <img src="/images/logo.jpg" alt="NextDoor" className="h-16 w-16 rounded-full mx-auto" />
          </div>
          <CardTitle className="text-2xl text-white">NextDoor CRM</CardTitle>
          <CardDescription className="text-gray-400">
            Storm Documentation Management System
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Lock className="w-4 h-4" />
              <span className="text-sm">Secure Team Access Only</span>
            </div>
          </div>

          <Button 
            onClick={handleLogin}
            className="w-full bg-primary hover:bg-primary/90 text-black font-semibold py-6"
          >
            <Shield className="w-5 h-5 mr-2" />
            Sign In to CRM
          </Button>

          <p className="text-xs text-center text-gray-500">
            Only authorized NextDoor Exterior Solutions team members can access this system.
            Contact your administrator if you need access.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
