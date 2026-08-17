"use client"

import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { AuthDialog } from "@/components/auth/auth-dialog";

export function PricingPlans() {
  const features = [
    "Unlimited base resumes",
    "Unlimited tailored resumes",
    "Unlimited ATS analysis",
    "Unlimited AI resume editing",
    "PDF export",
    "Automatic free-provider failover",
  ];

  return (
    <section className="py-24 md:py-32 px-4 relative overflow-hidden scroll-mt-20" id="pricing" aria-labelledby="pricing-heading">
      <div aria-hidden="true" className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-100/20" />
      <div aria-hidden="true" className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-teal-100/20" />
      <div className="relative z-10 max-w-3xl mx-auto text-center mb-12">
        <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-sm text-teal-700">Free Forever</span>
        <motion.h2 id="pricing-heading" initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-4xl md:text-5xl font-bold tracking-tight text-indigo-600 mt-4">Everything included</motion.h2>
        <p className="text-lg md:text-xl text-muted-foreground mt-4">No subscriptions, credits, trials, paywalls, or upgrade prompts.</p>
      </div>
      <div className="relative z-10 max-w-xl mx-auto rounded-2xl p-8 md:p-10 bg-indigo-50/50 border border-indigo-200 shadow-md">
        <div className="flex items-center gap-2 text-indigo-700 font-medium"><Sparkles className="h-5 w-5" /> ResumeLM Free Forever</div>
        <div className="flex items-baseline mt-4"><h3 className="text-5xl font-bold text-indigo-600">$0</h3><span className="text-muted-foreground ml-2">forever</span></div>
        <p className="text-muted-foreground mt-2 mb-7">Use the complete resume workflow repeatedly, subject only to the permitted free-provider quotas.</p>
        <AuthDialog next="/home">
          <button className="block w-full py-3 rounded-lg font-medium text-center bg-indigo-600 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all mb-8">Get Started Free</button>
        </AuthDialog>
        <div className="space-y-3">
          {features.map((feature) => <div key={feature} className="flex items-start"><Check className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" /><span>{feature}</span></div>)}
        </div>
      </div>
    </section>
  );
}

export default PricingPlans;
