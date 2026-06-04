"use client";

export function NewsletterForm() {
  return (
    <form
      className="flex w-full max-w-lg overflow-hidden rounded-md bg-white"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="Email"
        className="flex-1 px-4 py-3.5 text-sm text-niti-charcoal outline-none"
        aria-label="Email address"
      />
      <button
        type="submit"
        className="bg-niti-charcoal px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-niti-footer"
      >
        Subscribe
      </button>
    </form>
  );
}
