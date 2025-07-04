import { t } from "@lingui/macro";
import { motion } from "framer-motion";
import { Link } from "react-router";

import { Logo } from "@/client/components/logo";

export const Header = () => (
  <motion.header
    className="fixed inset-x-0 top-0 z-20"
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.3 } }}
  >
    <div className="bg-gradient-to-b from-background to-transparent py-3">
      <div className="container flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/">
            <Logo size={48} />
          </Link>
        </div>
        <div className="hidden sm:block">
          <div className="border-2 border-blue-800 bg-white px-6 py-3 rounded">
            <h1 className="text-lg font-bold text-blue-800">{t`GFAZE Resume - Powered by GigaFaze`}</h1>
          </div>
        </div>
        <div />
      </div>
    </div>
  </motion.header>
);
