import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, SignIn, SignUp, RedirectToSignIn } from "@clerk/clerk-react";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import Doctor from "./pages/Doctor";
import Patient from "./pages/Patient";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppShell = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/doctor" element={<Doctor />} />
    <Route path="/patient" element={<Patient />} />
    <Route path="/sign-in" element={<SignIn routing="path" path="/sign-in" />} />
    <Route path="/sign-up" element={<SignUp routing="path" path="/sign-up" />} />
    <Route
      path="/dashboard"
      element={
        <>
          <SignedIn>
            <Index />
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </>
      }
    />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
