const slots = document.querySelectorAll(".calculator-ad > .adsbygoogle");
if (slots.length) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      (window.adsbygoogle ??= []).push({});
    }
  }, { rootMargin: "150px" });
  slots.forEach(slot => observer.observe(slot));
}
