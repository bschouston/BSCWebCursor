import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            This feature is not yet implemented. We use Google Sign-In for
            authentication. Please use the option to sign in with your Google
            account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a href="/login" className="text-sm text-primary hover:underline">
            ← Back to Login
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
