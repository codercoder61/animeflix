import Link from 'next/link'
import { Facebook, MessageCircle, Twitter, Github, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-xl text-primary mb-2">AnimeFlix</h3>
            <p className="text-muted-foreground">
              Your ultimate anime streaming platform for all your favorite series.
            </p>
          </div>

          {/* Links */}
          

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="https://web.facebook.com/simo.knoud" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://wa.me/2120698522728" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <p className="text-center text-muted-foreground">
            © 2026 AnimeFlix. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
