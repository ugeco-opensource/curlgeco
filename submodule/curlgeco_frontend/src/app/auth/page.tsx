"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRuntimeConfig } from "@/components/providers/RuntimeConfigProvider";
import BrandLogo from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const signInSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signUpSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

export default function AuthPage() {
  const router = useRouter();
  const auth = useAuth();
  const config = useRuntimeConfig();

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSignIn = async (values: SignInValues) => {
    const result = await auth.signIn(values.email, values.password);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Welcome back");
    router.push("/");
  };

  const handleSignUp = async (values: SignUpValues) => {
    const result = await auth.signUp(values.name, values.email, values.password);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.requiresConfirmation) {
      toast.success("Check your email to confirm your account.");
      return;
    }

    toast.success("Account created");
    router.push("/");
  };

  return (
    <div className="grid min-h-[calc(100vh-8rem)] gap-8 lg:grid-cols-[1.1fr_520px] lg:items-center">
      <div className="space-y-8">
        <BrandLogo className="pt-4" />
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.32em] text-primary">
            curlgeco access
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-foreground lg:text-6xl">
            A sharper workspace for testing prompts, endpoints, and model behavior.
          </h1>
          <p className="max-w-2xl text-base leading-8 text-muted">
            Use Supabase for authentication today, keep the playground local-first,
            and deploy the same app to AKS behind the shared UGECO ingress later.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="glass-panel p-5">
            <Mail className="h-5 w-5 text-primary" />
            <p className="mt-4 text-sm font-semibold text-foreground">Email auth</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Email and password flows work without a custom backend.
            </p>
          </Card>
          <Card className="glass-panel p-5">
            <LockKeyhole className="h-5 w-5 text-primary" />
            <p className="mt-4 text-sm font-semibold text-foreground">Protected mode</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Flip <code>NEXT_PUBLIC_REQUIRE_AUTH</code> when the workspace should be private.
            </p>
          </Card>
          <Card className="glass-panel p-5">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <p className="mt-4 text-sm font-semibold text-foreground">Cluster ready</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              The same config model carries into Docker, Helm, and the AKS ingress.
            </p>
          </Card>
        </div>
      </div>

      <Card className="glass-panel card-glow p-6 sm:p-8">
        {auth.enabled ? (
          auth.user ? (
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-primary">
                  Signed in
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-foreground">
                  {auth.user.user_metadata?.display_name || auth.user.email}
                </h2>
                <p className="mt-2 text-sm leading-7 text-muted">
                  Your workspace is ready. Continue to the dashboard or sign out.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/">
                    Open workspace
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    const result = await auth.signOut();
                    if (result.error) {
                      toast.error(result.error);
                      return;
                    }
                    toast.success("Signed out");
                  }}
                >
                  Sign out
                </Button>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="signin" className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.24em] text-primary">
                  Authentication
                </p>
                <h2 className="text-3xl font-semibold text-foreground">
                  Sign in to curlgeco
                </h2>
                <p className="text-sm leading-7 text-muted">
                  Supabase email auth is enabled for this deployment.
                </p>
              </div>

              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form className="space-y-4" onSubmit={signInForm.handleSubmit(handleSignIn)}>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="you@company.com" {...signInForm.register("email")} />
                    {signInForm.formState.errors.email ? (
                      <p className="text-xs text-red-400">{signInForm.formState.errors.email.message}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" placeholder="Minimum 8 characters" {...signInForm.register("password")} />
                    {signInForm.formState.errors.password ? (
                      <p className="text-xs text-red-400">{signInForm.formState.errors.password.message}</p>
                    ) : null}
                  </div>
                  <Button type="submit" className="w-full">
                    Sign in
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form className="space-y-4" onSubmit={signUpForm.handleSubmit(handleSignUp)}>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input placeholder="Curlgeco Operator" {...signUpForm.register("name")} />
                    {signUpForm.formState.errors.name ? (
                      <p className="text-xs text-red-400">{signUpForm.formState.errors.name.message}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="you@company.com" {...signUpForm.register("email")} />
                    {signUpForm.formState.errors.email ? (
                      <p className="text-xs text-red-400">{signUpForm.formState.errors.email.message}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" placeholder="Minimum 8 characters" {...signUpForm.register("password")} />
                    {signUpForm.formState.errors.password ? (
                      <p className="text-xs text-red-400">{signUpForm.formState.errors.password.message}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm password</Label>
                    <Input type="password" placeholder="Repeat password" {...signUpForm.register("confirmPassword")} />
                    {signUpForm.formState.errors.confirmPassword ? (
                      <p className="text-xs text-red-400">{signUpForm.formState.errors.confirmPassword.message}</p>
                    ) : null}
                  </div>
                  <Button type="submit" className="w-full">
                    Create account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-primary">
                Supabase pending
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-foreground">
                Configure auth to enable signup and login.
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                This deployment is running in guest mode because the Supabase URL
                or anon key is missing.
              </p>
            </div>
            <div className="rounded-3xl border border-primary/15 bg-white/4 p-4 text-sm leading-7 text-muted">
              <p>
                Required env vars:
                <br />
                <code>NEXT_PUBLIC_SUPABASE_URL</code>
                <br />
                <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/">
                  Continue in guest mode
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`mailto:${config.supportEmail}`}>Contact {config.supportEmail}</Link>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
