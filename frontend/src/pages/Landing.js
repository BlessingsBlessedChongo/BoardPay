import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Layout, TrendingUp, ChevronRight, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  transition: { staggerChildren: 0.2 },
};

export default function Landing() {
  return (
    <div className="bg-gray-950 text-white overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tighter">
              The Future of Boarding House Management
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              A hybrid Web2/Web3 ledger bridging the gap between manual mobile money payments and dispute-proof, automated rent tracking.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 240, 255, 0.4)' }}
                className="bg-cyan-400 text-black font-semibold px-8 py-3 rounded-full hover:bg-cyan-300 transition-colors"
              >
                Start Managing Today
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="border border-cyan-400/50 text-cyan-400 font-semibold px-8 py-3 rounded-full hover:bg-cyan-400/10 transition-colors"
              >
                Learn More <ArrowRight className="inline ml-2 w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20"
          >
            <div className="glass-card p-8 sm:p-12">
              <div className="flex items-center justify-between gap-4 sm:gap-8">
                {/* Left side - Receipt */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="flex-1 flex justify-center"
                >
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg border border-gray-700 w-32 h-40">
                    <div className="text-xs text-gray-400 mb-3">Mobile Money</div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-700 rounded w-full"></div>
                      <div className="h-2 bg-gray-700 rounded w-5/6"></div>
                    </div>
                    <div className="mt-4 text-cyan-400 text-2xl font-bold">$500</div>
                  </div>
                </motion.div>

                {/* Arrow */}
                <div className="hidden sm:flex items-center justify-center">
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-cyan-400 text-3xl"
                  >
                    →
                  </motion.div>
                </div>

                {/* Right side - Verified Checkmark */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  className="flex-1 flex justify-center"
                >
                  <div className="bg-gradient-to-br from-green-900/20 to-cyan-900/20 p-6 rounded-lg border border-cyan-400/30 w-32 h-40 flex flex-col items-center justify-center">
                    <div className="text-3xl mb-2">✓</div>
                    <div className="text-xs text-cyan-400 text-center font-semibold">Verified & Logged</div>
                    <div className="text-xs text-gray-400 mt-2 text-center">Blockchain</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Built for Everyone</h2>
            <p className="text-gray-400 text-lg">Streamlined workflows for students, caretakers, and landlords</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Card 1: Students */}
            <motion.div variants={fadeInUp} className="glass-card p-8 hover:border-cyan-400/30 transition-colors">
              <div className="mb-6 p-3 bg-cyan-400/10 rounded-lg w-fit">
                <Smartphone className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">For Students</h3>
              <h4 className="text-cyan-400 font-semibold mb-3">Frictionless Uploads</h4>
              <p className="text-gray-400">
                Snap a picture of your mobile money receipt, upload it, and instantly notify your caretaker.
              </p>
            </motion.div>

            {/* Card 2: Caretakers */}
            <motion.div variants={fadeInUp} className="glass-card p-8 hover:border-cyan-400/30 transition-colors">
              <div className="mb-6 p-3 bg-cyan-400/10 rounded-lg w-fit">
                <Layout className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">For Caretakers</h3>
              <h4 className="text-cyan-400 font-semibold mb-3">High-Speed Verification</h4>
              <p className="text-gray-400">
                A desktop-first, split-screen workflow designed to verify hundreds of payments in minutes without downloading files.
              </p>
            </motion.div>

            {/* Card 3: Landlords */}
            <motion.div variants={fadeInUp} className="glass-card p-8 hover:border-cyan-400/30 transition-colors">
              <div className="mb-6 p-3 bg-cyan-400/10 rounded-lg w-fit">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">For Landlords</h3>
              <h4 className="text-cyan-400 font-semibold mb-3">Immutable Analytics</h4>
              <p className="text-gray-400">
                Track occupancy and monthly revenue in real-time. Verified payments are logged to an Ethereum smart contract for a dispute-proof ledger.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Layer Banner */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-950 via-cyan-950/20 to-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="mb-6 p-3 bg-cyan-400/10 rounded-full w-fit mx-auto">
              <span className="text-cyan-400 font-semibold text-sm">Blockchain-Secured</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Secured by the Blockchain</h2>
            <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
              Once a caretaker approves a payment, it is permanently logged via a Smart Contract, eliminating "lost receipt" disputes forever. Every transaction is timestamped, immutable, and verifiable on the Ethereum network—giving all parties complete transparency and peace of mind.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="mt-8 bg-cyan-400 text-black font-semibold px-8 py-3 rounded-full hover:bg-cyan-300 transition-colors inline-flex items-center gap-2"
            >
              Explore Security Features <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Transform Your Boarding House?</h2>
            <p className="text-gray-400 text-lg mb-8">
              Join hundreds of boarding houses already using BoardPay to streamline payments and eliminate disputes.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 240, 255, 0.4)' }}
              className="bg-cyan-400 text-black font-semibold px-8 py-3 rounded-full hover:bg-cyan-300 transition-colors inline-flex items-center gap-2"
            >
              Get Started Now <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
