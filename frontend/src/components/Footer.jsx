export default function Footer() {
  return (
    <footer className="bg-app-panel border-t border-app-border text-app-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-lg font-semibold">DevCode</p>
            <p className="text-app-muted text-sm">Debug Preparation Platform</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="#" className="text-app-muted hover:text-app-text transition-colors">About</a>
            <a href="#" className="text-app-muted hover:text-app-text transition-colors">Contact</a>
            <a href="#" className="text-app-muted hover:text-app-text transition-colors">Privacy</a>
            <a href="#" className="text-app-muted hover:text-app-text transition-colors">Terms</a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-app-border text-center text-app-muted text-sm">
          <p>&copy; {new Date().getFullYear()} DevCode. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
