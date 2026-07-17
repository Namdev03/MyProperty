import { Link } from "react-router";
import { Home, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#E7E4DC] bg-[#14213D] text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2 font-serif text-xl font-bold">
            <Home size={20} className="text-[#B8863B]" />
            MyProperty
          </div>
          <p className="mt-3 text-sm text-white/60">
            Find your perfect home, plot, or commercial space — trusted listings,
            verified owners.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/80">
            Explore
          </h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/properties" className="hover:text-white">Properties</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/80">
            For Owners
          </h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li><Link to="/signup" className="hover:text-white">List a property</Link></li>
            <li><Link to="/owner/dashboard" className="hover:text-white">Owner dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/80">
            Contact
          </h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li className="flex items-center gap-2"><Mail size={14} /> hello@myproperty.com</li>
            <li className="flex items-center gap-2"><Phone size={14} /> +91 98765 43210</li>
            <li className="flex items-center gap-2"><MapPin size={14} /> Indore, MP, India</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © {year} MyProperty. All rights reserved.
      </div>
    </footer>
  );
}
