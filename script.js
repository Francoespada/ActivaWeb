const header = document.getElementById("header");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const body = document.body;

function closeMenu(){
  menuToggle.classList.remove("active");
  navMenu.classList.remove("open");
  menuToggle.setAttribute("aria-expanded","false");
  body.classList.remove("menu-open");
}

menuToggle.addEventListener("click", () => {
  const open = !navMenu.classList.contains("open");
  menuToggle.classList.toggle("active", open);
  navMenu.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  body.classList.toggle("menu-open", open);
});

navMenu.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 25);
}, {passive:true});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, {threshold:.12, rootMargin:"0px 0px -45px 0px"});

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

const counters = document.querySelectorAll("[data-count]");
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count);
    const duration = 1000;
    const start = performance.now();
    function tick(now){
      const progress = Math.min((now-start)/duration,1);
      const eased = 1 - Math.pow(1-progress,3);
      el.textContent = Math.round(target*eased) + (target === 1 || target === 24 ? "" : " %");
      if(progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
},{threshold:.7});
counters.forEach(el => counterObserver.observe(el));

const glow = document.querySelector(".cursor-glow");
window.addEventListener("pointermove", e => {
  if(window.innerWidth > 900){
    glow.style.opacity = "1";
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  }
},{passive:true});

document.getElementById("year").textContent = new Date().getFullYear();

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", e => {
    const id = anchor.getAttribute("href");
    const target = document.querySelector(id);
    if(target){
      e.preventDefault();
      target.scrollIntoView({behavior:"smooth", block:"start"});
    }
  });
});
