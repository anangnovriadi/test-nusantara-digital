export default function Footer() {
  return (
    <footer className="w-full border-t bg-background py-4 mt-8">
      <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground flex flex-col md:flex-row justify-center items-center gap-1">
        <span>© {new Date().getFullYear()} PT Nusantara Digital. All rights reserved.</span>
      </div>
    </footer>
  );
}
