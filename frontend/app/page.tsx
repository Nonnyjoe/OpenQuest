"use client";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Trophy,
  Users,
  Zap,
  Brain,
  Target,
  Rocket,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { protocolService, UIProtocol } from "@/services/protocol-service";
import { quizService } from "@/services/quiz-service";

const techIcons = [
  { icon: "/icons/cartesi-ctsi-logo.svg", x: "20%", y: "20%" },
  { icon: "/icons/Ethereum-icon-purple.svg", x: "80%", y: "30%" },
  { icon: "/icons/Python-logo-notext.svg", x: "25%", y: "60%" },
  { icon: "/icons/rust-logo-two.png", x: "75%", y: "70%" },
  { icon: "/icons/solidity-logo.svg", x: "15%", y: "85%" },
  { icon: "/icons/typescript-svg.svg", x: "85%", y: "15%" },
];

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: ["-10px", "10px", "-10px"],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const features = [
  {
    icon: <Code2 className="h-10 w-10 text-primary" />,
    title: "Learn by Doing",
    description:
      "Participate in real-world projects and challenges to gain practical experience",
  },
  {
    icon: <Trophy className="h-10 w-10 text-secondary" />,
    title: "Win Rewards",
    description:
      "Earn rewards and recognition for your innovative solutions and contributions",
  },
  {
    icon: <Users className="h-10 w-10 text-accent" />,
    title: "Build Together",
    description:
      "Connect with like-minded developers and form teams for hackathons",
  },
  {
    icon: <Brain className="h-10 w-10 text-primary" />,
    title: "Test Your Skills",
    description: "Challenge yourself with technical quizzes and assessments",
  },
];

const howItWorks = [
  {
    number: "01",
    title: "Sign Up",
    description: "Create your account and complete your developer profile",
  },
  {
    number: "02",
    title: "Choose Your Path",
    description: "Browse available hackathons or take skill assessment quizzes",
  },
  {
    number: "03",
    title: "Build & Learn",
    description: "Participate in challenges and improve your skills",
  },
  {
    number: "04",
    title: "Earn Rewards",
    description: "Win prizes and get recognized for your achievements",
  },
];

const stats = [
  {
    icon: <Users className="h-8 w-8" />,
    number: "10K+",
    label: "Developers",
    gradient: "from-primary to-secondary",
  },
  {
    icon: <Trophy className="h-8 w-8" />,
    number: "500+",
    label: "Hackathons",
    gradient: "from-secondary to-accent",
  },
  {
    icon: <Target className="h-8 w-8" />,
    number: "1M+",
    label: "Completed Quizzes",
    gradient: "from-accent to-primary",
  },
  {
    icon: <Zap className="h-8 w-8" />,
    number: "$500K+",
    label: "Rewards Distributed",
    gradient: "from-primary to-secondary",
  },
];

export default function HomePage() {
  const [protocols, setProtocols] = useState<UIProtocol[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [protocolsData, quizzesData] = await Promise.all([
          protocolService.getAll(),
          quizService.getAll(),
        ]);

        setProtocols(protocolsData);
        setQuizzes(quizzesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative mx-auto flex min-h-screen max-w-[1440px] items-center justify-center px-4 sm:px-6 lg:px-8 before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-primary/5 before:via-secondary/5 before:to-accent/5">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <div className="space-y-4">
              <h1 className="font-heading text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="text-primary">Grow through</span> verified
                participation
              </h1>
              <p className="mx-auto max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                Improve your development skills by participating in hackathons
                and quizzes that continuously challenge and push your coding
                practice.
              </p>
            </div>
            <div className="space-x-4">
              <Button
                asChild
                size="lg"
                className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-primary/25"
              >
                <Link href="/register">
                  Get Started <ArrowRight className="h-4 w-4 animate-pulse" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="hover:scale-105 transition-all duration-300 hover:bg-gradient-to-r hover:from-secondary/10 hover:to-primary/10 hover:border-primary/50"
              >
                <Link href="/hackathons">Browse Hackathons</Link>
              </Button>
            </div>
          </div>

          {/* Floating Tech Icons */}
          <div className="absolute inset-0 -z-12 pointer-events-none">
            {techIcons.map((tech, index) => (
              <motion.div
                key={index}
                className="absolute h-12 w-12 md:h-16 md:w-16"
                style={{
                  left: tech.x,
                  top: tech.y,
                }}
                initial="initial"
                animate="animate"
                variants={floatingAnimation}
              >
                <div className="relative h-full w-full rounded-full bg-accent/10 p-2 backdrop-blur-sm">
                  <Image
                    src={tech.icon}
                    alt={`Tech Icon ${index + 1}`}
                    width={64}
                    height={64}
                    className="h-full w-full object-contain opacity-50"
                    priority={index < 2}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Why Choose <span className="text-primary">OpenQuest</span>
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground">
                Empower your development journey with features designed to help
                you grow and succeed
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative overflow-hidden rounded-lg border bg-gradient-to-br from-background via-background/95 to-background/90 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative">
                    <div className="mb-4 transition-transform duration-300 group-hover:scale-110">
                      {feature.icon}
                    </div>
                    <h3 className="mb-2 text-xl font-semibold transition-colors duration-300 group-hover:text-primary">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="relative overflow-hidden py-20">
          {/* Animated gradient background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 animate-gradient-x" />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
          </div>

          <div className="container px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                How It <span className="text-secondary">Works</span>
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground">
                Get started with OpenQuest in four simple steps
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {howItWorks.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative text-center"
                >
                  <div className="mb-4">
                    <span className="text-6xl font-bold bg-gradient-to-r from-primary/40 to-secondary/40 bg-clip-text text-transparent">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />
          </div>

          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-6xl">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-xl border border-[#2a2a2a] bg-black/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#6d28d9]/50 hover:shadow-xl"
                  >
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#6d28d9]/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative space-y-4">
                      <div
                        className={`inline-flex rounded-lg p-3 text-white shadow-lg ${
                          index === 0
                            ? "bg-[#6d28d9]"
                            : index === 1
                            ? "bg-[#06b6d4]"
                            : index === 2
                            ? "bg-[#ec4899]"
                            : "bg-[#6d28d9]"
                        }`}
                      >
                        {stat.icon}
                      </div>
                      <div className="space-y-2">
                        <div className="text-4xl font-bold text-white md:text-5xl">
                          {stat.number}
                        </div>
                        <div className="text-base font-medium text-gray-400">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-accent/5 py-20">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Start Your Journey?
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground">
                Join thousands of developers who are already learning, building,
                and earning with OpenQuest
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-primary/25"
                >
                  <Link href="/register">
                    Get Started <ArrowRight className="h-4 w-4 animate-pulse" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="hover:scale-105 transition-all duration-300 hover:bg-gradient-to-r hover:from-secondary/10 hover:to-primary/10 hover:border-primary/50"
                >
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
